import { Button, type ButtonProps } from "@/components/ui/button";

interface CopyButtonProps extends Omit<ButtonProps, "children"> {
  copied: boolean;
  copiedLabel: string;
  label: string;
}

export function CopyButton({
  className = "copy-button",
  copied,
  copiedLabel,
  label,
  ...props
}: CopyButtonProps) {
  return (
    <Button className={className} {...props}>
      {copied ? `✓ ${copiedLabel}` : `▣ ${label}`}
    </Button>
  );
}
