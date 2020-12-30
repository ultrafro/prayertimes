export const FlexRow = (props: any) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "row", ...props.style }}
      {...props}
    >
      {props.children}
    </div>
  );
};

export const FlexCol = (props: any) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", ...props.style }}
      {...props}
    >
      {props.children}
    </div>
  );
};
