import { Outlet } from 'react-router-dom';
import NewNavbar from '../components/common/NewNavbar';
import NewFooter from '../components/common/NewFooter';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <NewNavbar />
      <main className="flex-grow pt-20">
        <Outlet />
      </main>
      <NewFooter />
    </div>
  );
};

export default MainLayout;
