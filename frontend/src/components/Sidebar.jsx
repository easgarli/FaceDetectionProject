import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">Face Detection App</div>
      <nav>
        <NavLink to="/" end>
          Photos
        </NavLink>
        <NavLink to="/explore">
          Explore
        </NavLink>
      </nav>
    </div>
  );
}

export default Sidebar;