import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  // Guard in case provider isn't mounted yet
  const ctx = useAuth?.();
  const user = ctx?.user;
  const displayName = (user?.name || '').trim();

  return (
    <div className="max-w-5xl mx-auto mt-16 px-4">
      <section className="bg-white rounded-2xl shadow p-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
          Welcome, {displayName ? ` ${displayName}` : ''}
        </h1>
        <p className="text-gray-600 mb-6">
          Report issues around campus, track their status, attach photos as evidence, and
          help us improve campus life.
        </p>

        <div className="flex flex-wrap gap-3">
          {!user ? (
            <>
              <Link
                to="/register"
                className="inline-block bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded"
              >
                Get Started (Register)
              </Link>
              <Link
                to="/login"
                className="inline-block bg-black hover:bg-gray-900 text-white px-5 py-2.5 rounded"
              >
                I already have an account
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/complaints"
                className="inline-block bg-black hover:bg-gray-900 text-white px-5 py-2.5 rounded"
              >
                Go to My Complaints
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-lg mb-2">Create Complaints</h3>
          <p className="text-gray-600">
            Log a complaint with title, description, and date. Add up to 5 photos (JPG/PNG) as supporting documents.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-lg mb-2">Track Status</h3>
          <p className="text-gray-600">
            Watch your complaint progress through <span className="font-medium">received</span>, <span className="font-medium">resolving</span>, and <span className="font-medium">closed</span>.
          </p>
        </div>
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="font-semibold text-lg mb-2">Stay Updated</h3>
          <p className="text-gray-600">
            Return anytime to check updates and next steps from campus staff.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
