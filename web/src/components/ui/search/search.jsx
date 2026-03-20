function Search({ search, setSearch }) {
    return (
        <nav className="navbar">
            <div className="mx-auto" style={{width: '100%'}}>
                <div className="d-flex" role="search">
                    <input 
                        className="form-control me-4 rounded-pill search"
                        id="search"
                        type="search" 
                        placeholder="Search" 
                        value={search} 
                        onChange={(event) => setSearch(event.target.value)}/>
                </div>
            </div>
        </nav>
    );
}

export default Search;