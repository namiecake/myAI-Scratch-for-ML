import React from "react";

export const instructionsContent = {
  welcome: {
    title: "Welcome to My AI!",
    mainText:
      "Drag and drop your code blocks into the playground to build AI models with ease. Simply pick your blocks from the palette, connect them in the workspace, and click Train to see your neural network learn in real time. Your blocks are like magical ingredients—snap them together to complete challenges by creating AI models!",
  },
  challenge: {
    title: "Mushroom Mayhem",
    description:
      "Snow white is lost in a mysterious forest of fungi, where some mushrooms are deliciously edible and others dreadfully dangerous. Help Snow White by building a neural network that tells safe from poisonous mushrooms by creating a binary classification model.",
  },
  instructions: {
    title: "Go to the Code Tab to begin",
    bulletPoints: [
      "You can view the dataset in the Dataset Tab",
      "To get help, look for the information icons, hover over the blocks to learn more, and use the adaptive help in the bottom left corner of the code screen",
    ],
  },
  styles: {
    container: {
      height: "100%",
      width: "100%",
      borderRadius: "10px",
      padding: "20px",
      overflow: "auto",
    },
    title: {
      fontSize: "1em",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    section: {
      marginBottom: "20px",
    },
    bulletList: {
      marginLeft: "20px",
      marginTop: "10px",
    },
  },
};

export const InstructionsContent: React.FC = () => {
  return (
    <div>
      <div style={instructionsContent.styles.section}>
        <h3 style={instructionsContent.styles.title}>{instructionsContent.welcome.title}</h3>
        <p>{instructionsContent.welcome.mainText}</p>
      </div>

      <div style={instructionsContent.styles.section}>
        <h3 style={instructionsContent.styles.title}>{instructionsContent.challenge.title}</h3>
        <p>{instructionsContent.challenge.description}</p>
      </div>

      <div style={instructionsContent.styles.section}>
        <h3 style={instructionsContent.styles.title}>{instructionsContent.instructions.title}</h3>
        <ul style={instructionsContent.styles.bulletList}>
          {instructionsContent.instructions.bulletPoints.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
