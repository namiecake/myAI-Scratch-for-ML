// Sample data from the mushroom dataset
export const datasetContent = {
    title: "Weather Classification Dataset",
     // CSV data for preview
    csvData: `class,precipitation,temp_max,temp_min,wind
        stormy,0.0,12.8,5.0,4.7
        rainy,10.9,10.6,2.8,4.5
        sunny,0.0,10.0,2.8,2.0`,
   
   
    // Dataset statistics
    statistics: {
      totalRows: 1461,
      numFeatures: 7,
    },
   
   
    // Target variable information
    targetVariable: {
      name: "class",
      classes: [
        { label: "sunny ☀️", percentage: 44 },
        { label: "cloudy ☁️", percentage: 7 },
        { label: "rainy 🌧️", percentage: 30 },
        { label: "stormy 🌩️", percentage: 11 },
        { label: "snowy 🌨️", percentage: 8 }
      ]
    },
   
   
    // Feature descriptions
    features: [
      { name: "class", description: "The weather on this day" },
      { name: "precipitation", description: "The amount of rainfall or snowfall recorded" },
      { name: "temp_max", description: "The highest temp. recorded (°C)"},
      { name: "temp_min", description: "The lowest temp. recorded (°C)"},
      { name: "wind", description: "The wind speed (mph)"}
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
   
   