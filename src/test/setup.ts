import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";

if (typeof window !== "undefined" && !window.URL.createObjectURL) {
  window.URL.createObjectURL = () => "blob:lifeos-test";
}

if (typeof window !== "undefined" && !window.URL.revokeObjectURL) {
  window.URL.revokeObjectURL = () => undefined;
}
