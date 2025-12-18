import { Button } from "../ui/button";

export default function LogInButton({
  openLogin,
  setOpenLogin,
}: {
  openLogin: boolean;
  setOpenLogin: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <Button onClick={() => setOpenLogin(!openLogin)} variant="link" size="sm">
      Log In
    </Button>
  );
}
