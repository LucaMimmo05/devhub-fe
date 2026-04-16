type NoDataProps = {
  resource: string;
};

const NoData = ({ resource }: NoDataProps) => {
  return <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground text-sm text-center">No {resource} found</p>;
};

export default NoData;
