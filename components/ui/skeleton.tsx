// components/ui/skeleton.tsx

export const Skeleton = ({ count }: { count: number }) => {
  const skeletons = [];
  for (let i = 0; i < count; i++) {
    skeletons.push(<div key={i} className="skeleton bg-gray-300 rounded h-6 mb-2"></div>);
  }
  return <>{skeletons}</>;
};
