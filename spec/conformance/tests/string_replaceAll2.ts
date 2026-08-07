function unsafeRedactName(text, name) {
    return text.replace(new RegExp(name, "g"), "[REDACTED]");
}

function safeRedactName(text, name) {
    return text.replaceAll(name, "[REDACTED]");
}

const report =
    "A hacker called ha.*er used special characters in their name to breach the system.";

assert(unsafeRedactName(report, "ha.*er") == "A [REDACTED]s in their name to breach the system."); // "A [REDACTED]s in their name to breach the system."
assert(safeRedactName(report, "ha.*er") == "A hacker called [REDACTED] used special characters in their name to breach the system."); // "A hacker called [REDACTED] used special characters in their name to breach the system."

console.log(unsafeRedactName(report, "ha.*er"));
console.log(safeRedactName(report, "ha.*er"));

console.log("ALL DONE");
