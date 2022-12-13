import React from "react"

export const Layout = ({ children }: any) => {
    return (
        <div style={{ padding: 20, backgroundColor: "#eee", flexDirection: "row", minHeight: "100vh", minWidth: "100%", justifyContent: "center", alignItems: "center" }}>
            {children}
        </div>
    );
}

export default Layout;