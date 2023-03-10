import path from "path";
import { color } from "./colors.mjs";

let successes = 0;
let failures = [];
let describeStack = [];

const exitCodes = {
  ok: 0,
  failures: 1,
};

export const run = async () => {
  try {
    await import(
      path.resolve(process.cwd(), "test/tests.mjs")
    );
  } catch (e) {
    console.error(e);
  }
  printFailures();
  console.log(
    color(
      `<green>${successes}</green> tests passed, ` +
        `<red>${failures.length}</red> tests failed.`
    )
  );
  process.exit(
    failures.length > 0
      ? exitCodes.failures
      : exitCodes.ok
  );
};

const indent = (message) =>
  `${" ".repeat(describeStack.length * 2)}${message}`;

export const it = (name, body) => {
  try {
    body();
    console.log(
      indent(color(`<green>✓</green> ${name}`))
    );
    successes++;
  } catch (e) {
    console.log(indent(color(`<red>✗</red> ${name}`)));
    failures.push({
      error: e,
      name,
      describeStack,
    });
  }
};

const fullTestDescription = ({ name, describeStack }) =>
  [...describeStack, name]
    .map((name) => `<bold>${name}</bold>`)
    .join(" → ");

export const printFailure = (failure) => {
  console.error(color(fullTestDescription(failure)));
  console.error(failure.error);
  console.error("");
};

export const printFailures = () => {
  if (failures.length > 0) {
    console.error("");
    console.error("Failures:");
    console.error("");
  }
  failures.forEach(printFailure);
};

const withoutLast = (arr) => arr.slice(0, -1);

export const describe = (name, body) => {
  console.log(indent(name));
  describeStack = [...describeStack, name];
  body();
  describeStack = withoutLast(describeStack);
};
