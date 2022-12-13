import React from "react"

export const LayoutH = ({ children }: any) => {
    return (
        <div style={{ padding: 20, backgroundColor: "#eee", flexDirection: "row", minHeight: "100vh", minWidth: "100%", justifyContent: "center", alignItems: "center", display: "flex" }}>
            {children}
        </div>
    );
}

export default LayoutH;