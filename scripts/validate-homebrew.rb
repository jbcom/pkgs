#!/usr/bin/env ruby
# frozen_string_literal: true

# Validates the Homebrew package surface without requiring a local Homebrew
# installation. Formulae receive Ruby syntax validation. Casks additionally
# receive deterministic checks for the repository's versioned binary/app
# contract.

module HomebrewPackageValidation
  TOKEN = /\A[a-z0-9]+(?:-[a-z0-9]+)*\z/
  SEMVER = /\A\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?\z/
  SHA256 = /\A[0-9a-f]{64}\z/
  ARTIFACT_STANZAS = %w[
    app artifact binary colorpicker dictionary font input_method
    installer internet_plugin keyboard_layout manpage pkg prefpane
    qlplugin screen_saver service suite vst vst3 audio_unit
  ].freeze

  module_function

  def ruby_files(root, directory)
    Dir.glob(File.join(root, directory, "*.rb")).sort
  end

  def syntax_errors(paths)
    paths.each_with_object([]) do |path, errors|
      RubyVM::InstructionSequence.compile_file(path)
    rescue SyntaxError => e
      errors << "#{relative(path)}: invalid Ruby syntax: #{e.message.lines.first&.strip}"
    end
  end

  def cask_errors(path)
    source = File.read(path, encoding: "UTF-8")
    code = source.each_line.reject { |line| line.lstrip.start_with?("#") }.join
    errors = []
    label = relative(path)

    declarations = code.scan(/^\s*cask\s+["']([^"']+)["']\s+do\s*$/).flatten
    if declarations.length != 1
      errors << "#{label}: expected exactly one cask declaration"
      return errors
    end

    token = declarations.first
    filename_token = File.basename(path, ".rb")
    errors << "#{label}: cask token #{token.inspect} must match #{filename_token.inspect}" if token != filename_token
    errors << "#{label}: cask token #{token.inspect} must be lowercase words separated by hyphens" unless TOKEN.match?(token)

    versions = code.scan(/^\s+version\s+["']([^"']+)["']/).flatten
    if versions.length != 1
      errors << "#{label}: expected exactly one literal version stanza"
    elsif !SEMVER.match?(versions.first)
      errors << "#{label}: version #{versions.first.inspect} must be semantic and pinned"
    end

    sha_stanzas = code.scan(/^\s+sha256\b/)
    sha_values = stanza_values(code, "sha256")
    if sha_stanzas.empty?
      errors << "#{label}: missing sha256 stanza"
    elsif code.match?(/^\s+sha256\s+:no_check\b/)
      errors << "#{label}: sha256 :no_check is not allowed"
    elsif sha_values.empty?
      errors << "#{label}: sha256 stanza must contain at least one digest"
    else
      sha_values.each do |hash|
        errors << "#{label}: sha256 digest must be lowercase hexadecimal: #{hash}" unless SHA256.match?(hash)
      end
    end

    urls = code.scan(/^\s+url\s+["']([^"']+)["']/).flatten
    if urls.empty?
      errors << "#{label}: missing literal url stanza"
    else
      urls.each do |url|
        errors << "#{label}: download URL must use HTTPS: #{url}" unless url.start_with?("https://")
      end
    end

    {
      "name" => false,
      "desc" => false,
      "homepage" => true,
    }.each do |stanza, require_https|
      values = code.scan(/^\s+#{stanza}\s+["']([^"']+)["']/).flatten
      errors << "#{label}: missing literal #{stanza} stanza" if values.empty?
      next unless require_https

      values.each do |value|
        errors << "#{label}: homepage must use HTTPS: #{value}" unless value.start_with?("https://")
      end
    end

    artifact_pattern = /^\s+(?:#{ARTIFACT_STANZAS.join("|")})\b/
    errors << "#{label}: cask must declare at least one installable artifact" unless code.match?(artifact_pattern)

    errors
  end

  def stanza_values(code, stanza)
    lines = code.lines
    lines.each_with_index.each_with_object([]) do |(line, index), values|
      match = line.match(/^(\s+)#{stanza}\b/)
      next unless match

      statement = [line]
      indentation = match[1].length
      cursor = index + 1
      while cursor < lines.length
        continuation = lines[cursor]
        break if continuation.strip.empty?
        break if continuation[/^\s*/].length <= indentation

        statement << continuation
        cursor += 1
      end
      values.concat(statement.join.scan(/["']([^"']+)["']/).flatten)
    end
  end

  def validate(root)
    formulae = ruby_files(root, "Formula")
    casks = ruby_files(root, "Casks")
    errors = syntax_errors(formulae + casks)

    formula_tokens = formulae.map { |path| File.basename(path, ".rb") }
    cask_tokens = casks.map { |path| File.basename(path, ".rb") }
    (formula_tokens & cask_tokens).each do |token|
      errors << "#{token}: cannot exist in both Formula/ and Casks/"
    end

    casks.each { |path| errors.concat(cask_errors(path)) }
    [errors, formulae.length, casks.length]
  end

  def relative(path)
    path.delete_prefix("#{Dir.pwd}/")
  end
end

if $PROGRAM_NAME == __FILE__
  root = File.expand_path(ARGV.fetch(0, File.join(__dir__, "..")))
  errors, formula_count, cask_count = HomebrewPackageValidation.validate(root)
  unless errors.empty?
    warn errors.join("\n")
    exit 1
  end

  puts "Validated #{formula_count} Homebrew formula(s) and #{cask_count} cask(s)"
end
