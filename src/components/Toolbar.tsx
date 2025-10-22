import HomeButton from "./HomeButton";
import AboutButton from "./AboutButton";
//import GitHubButton from "./GitHubButton";

const Toolbar = () => {
  return (
    <>
      <div className="toolbar">
        <div className="tools-start">
          <HomeButton />
          <AboutButton />
        </div>
        <div className="tools-middle">
          <h1>Boring Marathon Planner</h1>
        </div>
        <div className="tools-end">
          {/* <GitHubButton /> */}
        </div>
      </div>
    </>
  );
};

export default Toolbar;
