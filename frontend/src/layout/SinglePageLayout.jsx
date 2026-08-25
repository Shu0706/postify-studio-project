import NewNavbar from '../components/common/NewNavbar';
import NewFooter from '../components/common/NewFooter';

const SinglePageLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <NewNavbar />
      <main>
        {children}
      </main>
      <NewFooter />
    </div>
  );
};

export default SinglePageLayout;
