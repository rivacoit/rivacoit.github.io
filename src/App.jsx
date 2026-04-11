import { useState, useEffect, useRef } from "react";
import { fetchBlockCatalog, fetchPlainTextFile } from "./blockCatalog.js";

const catalogLoadNotePosted = { projects: false, experiences: false, education: false };

const aboutOutput = () => `Victoria Yang — Stanford University
Intended major: Computer Science (B.S., expected June 2029)

I work across security, systems, and ML — from collegiate cyber defense and
infrastructure hardening to ML for drug discovery and multilingual speech tech.

I like building things that are technically rigorous and thoughtfully designed.`;

const HELP_TEXT = `Shell-style navigation:
  tab         autocomplete commands
  ls          list files in the current directory
  cd <dir>    enters a directory
  pwd         print working directory
  cat <file>  prints content of a file

Other:
  help        show this text
  clear       clear the screen
  (there may be other commands to discover)

Block files (first line = filename under folder, then body; ### between entries):
  public/projects.txt → ~/projects
  public/experiences.txt → ~/experiences

Plain text file at ~:
  public/education.txt → shown by: cat education`;

const VFS_HOME = {
  dirs: ["projects", "experiences"],
  files: ["about", "contact", "skills", "education", "help"],
};

function vfsNode(cwd, catalogs) {
  const projectSlugs = catalogs.projects.slugs;
  const experienceSlugs = catalogs.experiences.slugs;
  const key = cwd.join("/");
  if (key === "") return VFS_HOME;
  if (key === "projects") return { dirs: [], files: projectSlugs };
  if (key === "experiences") return { dirs: [], files: experienceSlugs };
  return null;
}

function formatPromptPath(cwd) {
  if (cwd.length === 0) return "~";
  return `~/${cwd.join("/")}`;
}

function physicalPath(cwd) {
  const base = "/home/visitor";
  if (cwd.length === 0) return base;
  return `${base}/${cwd.join("/")}`;
}

function lsOutput(cwd, catalogs) {
  const node = vfsNode(cwd, catalogs);
  if (!node) return "ls: cannot open directory: No such file or directory";

  const entries = [
    ...node.dirs.map((d) => `${d}/`),
    ...node.files,
  ].sort((a, b) => {
    const ad = a.endsWith("/");
    const bd = b.endsWith("/");
    if (ad !== bd) return ad ? -1 : 1;
    return a.localeCompare(b);
  });

  if (!entries.length) {
    return "(empty)";
  }
  return entries.join("\n");
}

function runCd(args, cwd) {
  if (args.length > 1) {
    return { nextCwd: cwd, error: "cd: too many arguments" };
  }

  const target = args[0];

  if (args.length === 0 || target === "~" || target === "~/" || target === "/") {
    return { nextCwd: [], error: null };
  }

  if (target === "..") {
    return { nextCwd: cwd.slice(0, -1), error: null };
  }

  const node = vfsNode(cwd, EMPTY_CATALOGS);
  if (!node) {
    return { nextCwd: cwd, error: "cd: not a directory" };
  }

  if (node.dirs.includes(target)) {
    return { nextCwd: [...cwd, target], error: null };
  }

  return { nextCwd: cwd, error: `cd: no such file or directory: ${target}` };
}

function runCat(args, cwd, catalogs, educationText) {
  if (args.length === 0) {
    return "cat: missing file operand";
  }
  if (args.length > 1) {
    return "cat: too many arguments";
  }

  const name = args[0];
  const node = vfsNode(cwd, catalogs);
  if (!node) {
    return "cat: no such file or directory";
  }
  if (!node.files.includes(name)) {
    if (node.dirs.includes(name)) {
      return `cat: ${name}: Is a directory`;
    }
    return `cat: ${name}: No such file or directory`;
  }

  const key = cwd.join("/");

  if (key === "") {
    if (name === "about") return aboutOutput();
    if (name === "contact") {
      return `Victoria Yang
Phone: (909) 729-7491
Email: vicyang@stanford.edu`;
    }
    if (name === "skills") {
      return `Awards
  • 1st place — Air & Space Force CyberPatriot Cisco Networking Challenge, CyberPatriot All-Service Division
  • 1st place — IgniteCS Programming Expo, GameGala; Orange County Science & Engineering Fair (Behavioural Science)

Programming: Python, Java, C++, Flutter/Dart

ML / AI: TensorFlow, Hugging Face, scikit-learn, rake-nltk

Cloud & infra: AWS (Lambda, S3), Firebase`;
    }
    if (name === "education") {
      if (educationText === null) {
        return "education.txt is still loading…";
      }
      return educationText;
    }
    if (name === "help") return HELP_TEXT;
  }

  if (key === "projects" && catalogs.projects.bySlug[name] !== undefined) {
    return catalogs.projects.bySlug[name];
  }

  if (key === "experiences" && catalogs.experiences.bySlug[name] !== undefined) {
    return catalogs.experiences.bySlug[name];
  }

  return `cat: ${name}: No such file or directory`;
}

const commands = {
  help: () => HELP_TEXT,

  /** Easter egg — not listed as a file in ls */
  whoami: aboutOutput,

  clear: () => "CLEAR",
};

function splitCommand(trimmed) {
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return { name: parts[0]?.toLowerCase() ?? "", args: parts.slice(1) };
}

const COMMAND_NAMES = ["cat", "cd", "clear", "help", "ls", "pwd", "whoami"];

function tokenizeBeforeCursor(before) {
  const tokens = [];
  const starts = [];
  let i = 0;
  while (i < before.length && /\s/.test(before[i])) i++;
  while (i < before.length) {
    const start = i;
    while (i < before.length && !/\s/.test(before[i])) i++;
    tokens.push(before.slice(start, i));
    starts.push(start);
    while (i < before.length && /\s/.test(before[i])) i++;
  }
  const endsWithSpace = before.length > 0 && /\s/.test(before[before.length - 1]);
  return { tokens, starts, endsWithSpace };
}

function cdTargets(cwd, catalogs) {
  const node = vfsNode(cwd, catalogs);
  const dirs = node?.dirs ?? [];
  return [...new Set([...dirs, "..", "~"])].sort((a, b) => a.localeCompare(b));
}

function catTargets(cwd, catalogs) {
  const node = vfsNode(cwd, catalogs);
  return node ? [...node.files].sort((a, b) => a.localeCompare(b)) : [];
}

function commonPrefix(strings) {
  if (!strings.length) return "";
  let pref = strings[0];
  for (const s of strings) {
    while (!s.startsWith(pref) && pref.length) pref = pref.slice(0, -1);
  }
  return pref;
}

function getCompletionContext(line, cursor) {
  const before = line.slice(0, cursor);
  if (/^\s+$/.test(before)) return { kind: "none" };

  const { tokens, starts, endsWithSpace } = tokenizeBeforeCursor(before);

  if (tokens.length === 0) {
    if (endsWithSpace) return { kind: "none" };
    return { kind: "command", prefix: "", tokenStart: 0 };
  }

  if (tokens.length === 1 && !endsWithSpace) {
    return { kind: "command", prefix: tokens[0], tokenStart: starts[0] };
  }

  if (tokens.length === 1 && endsWithSpace) {
    const cmd = tokens[0].toLowerCase();
    if (cmd === "cd") return { kind: "cd-arg", prefix: "", append: true };
    if (cmd === "cat") return { kind: "cat-arg", prefix: "", append: true };
    return { kind: "none" };
  }

  if (tokens.length >= 2 && !endsWithSpace) {
    const cmd = tokens[0].toLowerCase();
    const lastIdx = tokens.length - 1;
    if (cmd === "cd") {
      return {
        kind: "cd-arg",
        prefix: tokens[lastIdx],
        tokenStart: starts[lastIdx],
        append: false,
      };
    }
    if (cmd === "cat") {
      return {
        kind: "cat-arg",
        prefix: tokens[lastIdx],
        tokenStart: starts[lastIdx],
        append: false,
      };
    }
  }

  return { kind: "none" };
}

function candidatesForContext(ctx, cwd, catalogs) {
  const pl = ctx.prefix.toLowerCase();
  if (ctx.kind === "command") {
    return COMMAND_NAMES.filter((c) => c.startsWith(pl));
  }
  if (ctx.kind === "cd-arg") {
    return cdTargets(cwd, catalogs).filter((c) => c.startsWith(pl));
  }
  if (ctx.kind === "cat-arg") {
    return catTargets(cwd, catalogs).filter((c) => c.startsWith(pl));
  }
  return [];
}

/** Returns { line, cursor, listMatches? } or null if no-op */
function tabComplete(line, cursor, cwd, catalogs) {
  const ctx = getCompletionContext(line, cursor);
  if (ctx.kind === "none") return null;

  const matches = candidatesForContext(ctx, cwd, catalogs);
  if (!matches.length) return null;

  const lcp = commonPrefix(matches);
  const before = line.slice(0, cursor);
  const after = line.slice(cursor);

  const replaceToken = (newToken, tokenStart, oldLen) => {
    const nb = before.slice(0, tokenStart) + newToken + before.slice(tokenStart + oldLen);
    const nl = nb + after;
    const nc = nb.length;
    return { line: nl, cursor: nc };
  };

  if (ctx.kind === "command") {
    const oldLen = ctx.prefix.length;
    const pl = ctx.prefix.toLowerCase();
    if (matches.length === 1) {
      const m = matches[0];
      if (m === pl) {
        const nb = before.slice(0, ctx.tokenStart) + m + " ";
        return { line: nb + after, cursor: nb.length };
      }
      return replaceToken(m, ctx.tokenStart, oldLen);
    }
    if (lcp.length > pl.length) {
      return replaceToken(lcp, ctx.tokenStart, oldLen);
    }
    return { line, cursor, listMatches: matches };
  }

  if (ctx.kind === "cd-arg" || ctx.kind === "cat-arg") {
    if (ctx.append) {
      if (matches.length === 1) {
        const nb = before + matches[0];
        return { line: nb + after, cursor: nb.length };
      }
      if (lcp.length > 0) {
        const nb = before + lcp;
        return { line: nb + after, cursor: nb.length };
      }
      return { line, cursor, listMatches: matches };
    }

    const oldLen = ctx.prefix.length;
    const pl = ctx.prefix.toLowerCase();
    if (matches.length === 1) {
      const m = matches[0];
      return replaceToken(m, ctx.tokenStart, oldLen);
    }
    if (lcp.length > pl.length) {
      return replaceToken(lcp, ctx.tokenStart, oldLen);
    }
    return { line, cursor, listMatches: matches };
  }

  return null;
}

const EMPTY_CATALOGS = {
  projects: { bySlug: Object.create(null), slugs: [] },
  experiences: { bySlug: Object.create(null), slugs: [] },
};

export default function App() {
  const [history, setHistory] = useState([
    { type: "output", text: "Initializing system..." },
    { type: "output", text: "Access granted." },
    { type: "output", text: "Try ls, then cd projects or experiences. cat education for school info." },
  ]);
  const [cwd, setCwd] = useState([]);
  const [catalogs, setCatalogs] = useState(EMPTY_CATALOGS);
  /** null = loading; string = loaded body or error placeholder */
  const [educationText, setEducationText] = useState(null);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled([
        fetchBlockCatalog("projects.txt"),
        fetchBlockCatalog("experiences.txt"),
        fetchPlainTextFile("education.txt"),
      ]);
      if (cancelled) return;

      const [pRes, eRes, edRes] = results;
      setCatalogs((prev) => ({
        projects: pRes.status === "fulfilled" ? pRes.value : prev.projects,
        experiences: eRes.status === "fulfilled" ? eRes.value : prev.experiences,
      }));

      if (edRes.status === "fulfilled") {
        const raw = edRes.value.trimEnd();
        setEducationText(raw === "" ? "(no content yet — edit public/education.txt)" : raw);
      } else {
        setEducationText("(could not load education.txt)");
        if (!catalogLoadNotePosted.education) {
          catalogLoadNotePosted.education = true;
          setHistory((prev) => [
            ...prev,
            {
              type: "output",
              text: "Could not load education.txt — cat education will show a placeholder until the file is available.",
            },
          ]);
        }
      }

      if (pRes.status === "rejected" && !catalogLoadNotePosted.projects) {
        catalogLoadNotePosted.projects = true;
        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            text: "Could not load projects.txt — ~/projects will be empty until the file is available.",
          },
        ]);
      }
      if (eRes.status === "rejected" && !catalogLoadNotePosted.experiences) {
        catalogLoadNotePosted.experiences = true;
        setHistory((prev) => [
          ...prev,
          {
            type: "output",
            text: "Could not load experiences.txt — ~/experiences will be empty until the file is available.",
          },
        ]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, input]);

  const handleTab = (e) => {
    e.preventDefault();
    const el = inputRef.current;
    if (!el) return;

    const cursor = typeof el.selectionStart === "number" ? el.selectionStart : input.length;
    const result = tabComplete(input, cursor, cwd, catalogs);
    if (!result) return;

    if (result.listMatches?.length) {
      setHistory((prev) => [
        ...prev,
        { type: "output", text: result.listMatches.join("  ") },
      ]);
      return;
    }

    setInput(result.line);
    const nextCursor = result.cursor;
    requestAnimationFrame(() => {
      el.setSelectionRange(nextCursor, nextCursor);
    });
  };

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim();
    const pathAtExec = formatPromptPath(cwd);

    if (trimmed === "") {
      setHistory((prev) => [...prev, { type: "input", text: "", path: pathAtExec }]);
      setInput("");
      return;
    }

    const { name, args } = splitCommand(trimmed);

    let output = null;
    let nextCwd = cwd;

    if (name === "ls") {
      output = lsOutput(cwd, catalogs);
    } else if (name === "pwd") {
      output = physicalPath(cwd);
    } else if (name === "cd") {
      const result = runCd(args, cwd);
      nextCwd = result.nextCwd;
      output = result.error;
    } else if (name === "cat") {
      output = runCat(args, cwd, catalogs, educationText);
    } else if (commands[trimmed]) {
      output = commands[trimmed]();
    } else {
      output = `command not found: ${trimmed}. Type help for hints.`;
    }

    if (output === "CLEAR") {
      setHistory([]);
    } else {
      if (nextCwd !== cwd) {
        setCwd(nextCwd);
      }
      setHistory((prev) => [
        ...prev,
        { type: "input", text: trimmed, path: pathAtExec },
        ...(output !== null && output !== ""
          ? [{ type: "output", text: output }]
          : []),
      ]);
    }

    setInput("");
  };

  const promptPath = formatPromptPath(cwd);

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      {history.map((line, i) => (
        <pre key={i} className="terminal-line">
          {line.type === "input"
            ? `visitor@victoriayang:${line.path ?? "~"}$ ${line.text}`
            : line.text}
        </pre>
      ))}

      <div className="terminal-input-row">
        <span className="terminal-prompt">visitor@victoriayang:{promptPath}$</span>
        <input
          ref={inputRef}
          className="terminal-input"
          type="text"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          aria-label="Terminal command"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCommand(input);
            if (e.key === "Tab") handleTab(e);
          }}
          autoFocus
        />
      </div>

      <div ref={bottomRef} />
    </div>
  );
}
