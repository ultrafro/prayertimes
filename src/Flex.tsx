export const FlexRow = (props: any) => {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
};

export const FlexCol = (props: any) => {
  return (
    <div
      {...props}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        ...props.style,
      }}
    >
      {props.children}
    </div>
  );
};
