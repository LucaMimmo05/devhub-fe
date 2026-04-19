type NoDataProps = {
  resource: string;
};

const NoData = ({ resource }: NoDataProps) => {
  return (
    <div className="flex items-center justify-center py-6 w-full">
      <p className="text-muted-foreground text-sm text-center">No {resource} found</p>
    </div>
  );
};

export default NoData;
