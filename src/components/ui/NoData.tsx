type NoDataProps = {
  resource: string;
};

const NoData = ({ resource }: NoDataProps) => {
  return <p className="text-muted-foreground text-sm text-center">No {resource} found</p>;
};

export default NoData;
