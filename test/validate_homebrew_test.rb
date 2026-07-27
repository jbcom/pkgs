# frozen_string_literal: true

require "fileutils"
require "minitest/autorun"
require "tmpdir"

require_relative "../scripts/validate-homebrew"

class ValidateHomebrewTest < Minitest::Test
  def setup
    @root = Dir.mktmpdir("pkgs-homebrew-")
    FileUtils.mkdir_p(File.join(@root, "Formula"))
    FileUtils.mkdir_p(File.join(@root, "Casks"))
  end

  def teardown
    FileUtils.remove_entry(@root)
  end

  def write(directory, name, source)
    File.write(File.join(@root, directory, "#{name}.rb"), source)
  end

  def errors
    HomebrewPackageValidation.validate(@root).first
  end

  def test_accepts_versioned_cli_and_architecture_specific_gui_casks
    write("Casks", "radioactive-ralph", <<~RUBY)
      cask "radioactive-ralph" do
        version "0.22.0"
        sha256 "#{"a" * 64}"
        url "https://example.test/radioactive-ralph-\#{version}.zip"
        name "Radioactive Ralph"
        desc "Agent orchestrator"
        homepage "https://github.com/jbcom/radioactive-ralph"
        binary "radioactive_ralph"
      end
    RUBY
    write("Casks", "radioactive-ralph-gui", <<~RUBY)
      cask "radioactive-ralph-gui" do
        version "0.22.0"
        on_arm do
          sha256 "#{"b" * 64}"
          url "https://example.test/radioactive-ralph-\#{version}-arm64.zip"
        end
        on_intel do
          sha256 "#{"c" * 64}"
          url "https://example.test/radioactive-ralph-\#{version}-amd64.zip"
        end
        name "Radioactive Ralph GUI"
        desc "Agent orchestrator cockpit"
        homepage "https://github.com/jbcom/radioactive-ralph"
        app "Radioactive Ralph.app"
      end
    RUBY

    assert_empty errors
  end

  def test_rejects_missing_artifact
    write("Casks", "no-artifact", <<~RUBY)
      cask "no-artifact" do
        version "1.2.3"
        sha256 "#{"d" * 64}"
        url "https://example.test/no-artifact.zip"
        name "No Artifact"
        desc "Invalid cask"
        homepage "https://example.test/"
      end
    RUBY

    assert_includes errors.join("\n"), "must declare at least one installable artifact"
  end

  def test_rejects_one_invalid_architecture_digest
    write("Casks", "bad-digest", <<~RUBY)
      cask "bad-digest" do
        version "1.2.3"
        sha256 arm:   "#{"f" * 64}",
               intel: "not-a-digest"
        url "https://example.test/bad-digest.zip"
        name "Bad Digest"
        desc "Invalid cask"
        homepage "https://example.test/"
        binary "bad-digest"
      end
    RUBY

    assert_includes errors.join("\n"), "sha256 digest must be lowercase hexadecimal: not-a-digest"
  end

  def test_rejects_formula_and_cask_token_collision
    write("Formula", "collision", "class Collision < Formula; end\n")
    write("Casks", "collision", <<~RUBY)
      cask "collision" do
        version "1.2.3"
        sha256 "#{"e" * 64}"
        url "https://example.test/collision.zip"
        name "Collision"
        desc "Collision"
        homepage "https://example.test/"
        binary "collision"
      end
    RUBY

    assert_includes errors.join("\n"), "cannot exist in both Formula/ and Casks/"
  end

  def test_rejects_invalid_ruby
    write("Casks", "broken", "cask \"broken\" do\n")

    assert_includes errors.join("\n"), "invalid Ruby syntax"
  end
end
