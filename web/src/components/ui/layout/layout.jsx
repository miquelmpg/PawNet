function Layout({ children }) {
    return (
        <div className="container d-flex flex-column gap-1">{children}</div>
    );
}

export default Layout;