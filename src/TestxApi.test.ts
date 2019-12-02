import test from "ava";
import { isTestxApiMethod } from "./TestxApi";

test("is TestxApi method", t => {
  t.true(isTestxApiMethod("setData"));
  t.true(isTestxApiMethod("start"));
  t.false(isTestxApiMethod("foo"));
});
