import { Button } from "../primitives/button.js";

export default {
  title: "Primitives/Button",
  component: Button,
};

export const Default = () => <Button>Primary Action</Button>;
export const Secondary = () => (
  <Button variant="secondary">Secondary Action</Button>
);
export const Destructive = () => (
  <Button variant="destructive">Delete Asset</Button>
);
export const Disabled = () => <Button disabled>Disabled Button</Button>;
