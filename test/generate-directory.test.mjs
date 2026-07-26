import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { generateDirectory } from "../scripts/generate-directory.mjs";

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), "pkgs-directory-"));
  await Promise.all(
    ["Formula", "Casks", "bucket", "choco"].map((directory) =>
      mkdir(join(root, directory), { recursive: true }),
    ),
  );
  return root;
}

test("indexes casks distinctly and merges cross-packager package tokens", async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  await writeFile(
    join(root, "Formula", "paranoid-passwd.rb"),
    `class ParanoidPasswd < Formula
  desc "Password manager"
  homepage "https://github.com/jbcom/paranoid-passwd"
  version "3.6.5"
  license "GPL-3.0-only"
end
`,
  );
  await writeFile(
    join(root, "Casks", "radioactive-ralph.rb"),
    `cask "radioactive-ralph" do
  version "0.22.0"
  sha256 "${"a".repeat(64)}"
  url "https://example.test/radioactive-ralph-\#{version}.zip"
  name "Radioactive Ralph"
  desc "Agent orchestrator"
  homepage "https://github.com/jbcom/radioactive-ralph"
  binary "radioactive_ralph"
end
`,
  );
  await writeFile(
    join(root, "Casks", "radioactive-ralph-gui.rb"),
    `cask "radioactive-ralph-gui" do
  version "0.22.0"
  sha256 "${"b".repeat(64)}"
  url "https://example.test/radioactive-ralph-gui-\#{version}.zip"
  name "Radioactive Ralph GUI"
  desc "Agent orchestrator cockpit"
  homepage "https://github.com/jbcom/radioactive-ralph"
  app "Radioactive Ralph.app"
end
`,
  );
  await writeFile(
    join(root, "bucket", "radioactive-ralph.json"),
    JSON.stringify({
      version: "0.22.0",
      description: "Agent orchestrator",
      homepage: "https://github.com/jbcom/radioactive-ralph",
      license: "MIT",
      url: "https://example.test/radioactive-ralph.zip",
      hash: "c".repeat(64),
    }),
  );

  const out = join(root, "directory.json");
  const directory = await generateDirectory({ root, out });

  assert.deepEqual(
    directory.map(({ id, tags, packagers }) => ({ id, tags, packagers })),
    [
      {
        id: "paranoid-passwd",
        tags: ["homebrew-formula"],
        packagers: { "homebrew-formula": "3.6.5" },
      },
      {
        id: "radioactive-ralph",
        tags: ["homebrew-cask", "scoop"],
        packagers: { "homebrew-cask": "0.22.0", scoop: "0.22.0" },
      },
      {
        id: "radioactive-ralph-gui",
        tags: ["homebrew-cask"],
        packagers: { "homebrew-cask": "0.22.0" },
      },
    ],
  );

  const firstWrite = await readFile(out, "utf8");
  await generateDirectory({ root, out });
  assert.equal(await readFile(out, "utf8"), firstWrite);
});

test("rejects a Homebrew token published as both formula and cask", async (t) => {
  const root = await fixture();
  t.after(() => rm(root, { recursive: true, force: true }));

  await writeFile(join(root, "Formula", "collision.rb"), 'version "1.0.0"\n');
  await writeFile(join(root, "Casks", "collision.rb"), 'version "1.0.0"\n');

  await assert.rejects(
    generateDirectory({ root, out: join(root, "directory.json") }),
    /exists as both a Homebrew formula and cask/,
  );
});
