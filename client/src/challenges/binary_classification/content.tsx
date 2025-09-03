// Sample data from the mushroom dataset
export const datasetContent = {
    title: "Mushroom Classification Dataset",
     // CSV data for preview
    csvData: `class,cap-shape,cap-surface,cap-color,bruises,odor,gill-attachment,gill-spacing,gill-size,gill-color,stalk-shape,stalk-root,stalk-surface-above-ring,stalk-surface-below-ring,stalk-color-above-ring,stalk-color-below-ring,veil-type,veil-color,ring-number,ring-type,spore-print-color,population,habitat
   p,x,s,n,t,p,f,c,n,k,e,e,s,s,w,w,p,w,o,p,k,s,u
   e,x,s,y,t,a,f,c,b,k,e,c,s,s,w,w,p,w,o,p,n,n,g
   e,b,s,w,t,l,f,c,b,n,e,c,s,s,w,w,p,w,o,p,n,n,m`,
   
   
    // Dataset statistics
    statistics: {
      totalRows: 8124,
      numFeatures: 22,
    },
   
   
    // Target variable information
    targetVariable: {
      name: "class",
      classes: [
        { value: "e", label: "edible", percentage: 52, color: "#28a745" },
        { value: "p", label: "poisonous", percentage: 48, color: "#dc3545" }
      ]
    },
   
   
    // Feature descriptions
    features: [
      { name: "class", description: "Whether the mushroom is poisonous or edible" },
      { name: "cap-shape", description: "Shape of the mushroom cap" },
      { name: "cap-surface", description: "Surface texture of the mushroom cap" },
      { name: "cap-color", description: "Color of the mushroom cap" },
      { name: "bruises", description: "Whether the mushroom has bruises" },
      { name: "odor", description: "Aroma of the mushroom" },
      { name: "gill-attachment", description: "Attachment of the gill to the stalk" },
      { name: "gill-spacing", description: "Distance between the gills" },
      { name: "gill-size", description: "Size of the gill" },
      { name: "gill-color", description: "Color of the gill" },
      { name: "stalk-shape", description: "Shape of the stalk" },
      { name: "stalk-root", description: "Type of the stalk root" },
      { name: "stalk-surface-above-ring", description: "Surface of the stalk above the ring" },
      { name: "stalk-surface-below-ring", description: "Surface of the stalk below the ring" },
      { name: "stalk-color-above-ring", description: "Color of the stalk above the ring" },
      { name: "stalk-color-below-ring", description: "Color of the stalk below the ring" },
      { name: "veil-type", description: "Type of the veil" },
      { name: "veil-color", description: "Color of the veil" },
      { name: "ring-number", description: "Number of the ring" },
      { name: "ring-type", description: "Type of the ring" },
      { name: "spore-print-color", description: "Color of the spore print" },
      { name: "population", description: "Population of the mushroom" },
      { name: "habitat", description: "Habitat of the mushroom" }
    ],
   
   
    // Styling configurations
    styles: {
      tableStyles: {
        headerBackground: "#e9ecef",
        borderColor: "#dee2e6",
        cellPadding: "8px 15px",
      },
      previewBackground: "#f8f9fa",
    }
   } as const;
   
   