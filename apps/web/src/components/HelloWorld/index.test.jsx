import React from "react"
import { render, screen, cleanup } from "@testing-library/react"
import HelloWorld from "./index.jsx"

describe("HelloWorld Component in index.jsx", () => {
  afterEach(() => {
    cleanup();
  }),
  it('renders an <h1> with the text "HelloWorld"', () => {
    render(<HelloWorld />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('HelloWorld');
  });
});
