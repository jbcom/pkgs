cask "radioactive-ralph-gui" do
  version "0.35.6"

  on_arm do
    sha256 "bfb91101a7114f2053cca5421bd5ee8b75d87c5708395e356b4b2befe994da0c"
    url "https://github.com/jbcom/radioactive-ralph/releases/download/v#{version}/radioactive-ralph_#{version}_darwin_arm64.dmg"
  end
  on_intel do
    sha256 "498d3a3035655a109c4df1f2649fe63b0a72ff6538e6cfb87667a4a568e72303"
    url "https://github.com/jbcom/radioactive-ralph/releases/download/v#{version}/radioactive-ralph_#{version}_darwin_amd64.dmg"
  end

  name "radioactive-ralph"
  desc "Supervised-execution runtime for local AI-agent CLIs"
  homepage "https://github.com/jbcom/radioactive-ralph"

  app "radioactive-ralph.app"

  # The app is ad-hoc signed (free, no Apple Developer cert), so Gatekeeper
  # would quarantine it on first launch. Strip the quarantine attribute after
  # install so it opens cleanly — the standard OSS-cask approach for an
  # un-notarized app. (Homebrew does NOT remove quarantine by default.)
  postflight do
    system_command "/usr/bin/xattr",
                   args: ["-dr", "com.apple.quarantine", "#{appdir}/radioactive-ralph.app"],
                   sudo: false
  end

  caveats <<~EOS
    Install the CLI cask, start the supervisor, and register a project:

      brew install --cask radioactive-ralph
      radioactive_ralph service install
      cd /path/to/repo && radioactive_ralph --init

    The desktop app and the terminal UI are peers on the same local supervisor.
  EOS
end
