import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";

type BackButtonProps = {
  fallbackPath?: string;
  label?: string;
};

export function BackButton({ fallbackPath = "/", label = "Back" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(fallbackPath);
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
      type="button"
    >
      <ArrowLeft className="w-4 h-4" />
      {label}
    </button>
  );
}
