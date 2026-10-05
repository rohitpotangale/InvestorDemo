import ShimmerText from "@/components/ShimmerText";

export default function LoadingState() {
  return (
    <div className="flex items-center justify-center">
      <ShimmerText className="text-sm font-medium tracking-[-0.01em]">
        Analyzing your request...
      </ShimmerText>
    </div>
  );
}