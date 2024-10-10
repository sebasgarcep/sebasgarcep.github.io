import barranquillaImg from "@/assets/barranquilla.jpeg";

const content =
  "I'm a Software Engineer based out of Toronto, Canada. I grew up in the lovely city of Barranquilla, Colombia 🇨🇴. I love building data pipelines and mining data for insights. The main tools in my kit are SQL, Python, Javascript (NodeJS), Java and Spark. I also like building user interfaces in React and React Native. In my spare time you can find me geeking about tech and math 🤓, Reading 📖, or playing Pokemon 🎮.";

export const About = () => {
  return (
    <div>
      <h1>About me</h1>
      <span>{content}</span>
      <img src={barranquillaImg} />
    </div>
  );
};
