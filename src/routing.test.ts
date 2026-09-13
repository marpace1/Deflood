import test from "node:test";
import assert from "node:assert/strict";
import { roadsFor, findRoutes, type Edge } from "./routing.ts";
test("normal scenario selects the shortest eligible road", () => {
  const route = findRoutes(
    roadsFor("Normal conditions"),
    "tapesia",
    "school",
  )[0];
  assert.equal(route.km, 1.2);
  assert.deepEqual(route.nodes, ["tapesia", "school"]);
});
test("a flooded shortcut is excluded and ridge alternative selected", () => {
  const routes = findRoutes(
    roadsFor("Flooded road report"),
    "tapesia",
    "school",
  );
  assert.deepEqual(routes[0].nodes, ["tapesia", "hall", "school"]);
  assert.equal(routes[0].km, 3.9000000000000004);
  assert.ok(
    routes.every((r) => !(r.nodes[0] === "tapesia" && r.nodes[1] === "school")),
  );
});
test("bridge closure cannot appear in any recommended path", () => {
  const routes = findRoutes(roadsFor("Bridge closure"), "tapesia", "hospital");
  assert.ok(routes.length > 0);
  assert.ok(
    routes.every(
      (r) =>
        !r.nodes.some(
          (n, i) => n === "tapesia" && r.nodes[i + 1] === "sonapur",
        ),
    ),
  );
});
test("severe flooding isolates Tapesia rather than recommending a dangerous route", () =>
  assert.equal(
    findRoutes(roadsFor("Red emergency"), "tapesia", "school").length,
    0,
  ));
test("unknown and partially blocked roads are excluded", () => {
  for (const status of ["Unknown", "Partially blocked", "Dangerous"] as const) {
    const edges: Edge[] = [{ a: "a", b: "b", km: 1, name: "unsafe", status }];
    assert.equal(findRoutes(edges, "a", "b").length, 0);
  }
});
test("route graph handles disconnected nodes and cycles", () => {
  assert.equal(
    findRoutes(roadsFor("Normal conditions"), "missing", "school").length,
    0,
  );
  const routes = findRoutes(roadsFor("Normal conditions"), "baren", "hospital");
  assert.ok(routes.length > 0);
  assert.ok(routes.every((r) => new Set(r.nodes).size === r.nodes.length));
});
