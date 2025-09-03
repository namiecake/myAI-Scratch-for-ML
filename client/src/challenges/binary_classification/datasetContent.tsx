import React from 'react';
import { datasetContent } from './content';


export const BinaryClassificationDataset: React.FC = () => {
 const content = datasetContent;
 const lines = content.csvData.trim().split('\n');
 const headers = lines[0].split(',');
 const firstThreeRows = lines.slice(1, 4).map(line => line.split(','));


 return (
   <>
     <div style={{
       display: "flex",
       gap: "20px",
       marginBottom: "20px",
       justifyContent: "space-between"
     }}>
       <div style={{ flex: "0 1 55%" }}>
         <h3 style={{ fontWeight: "bold" }}>Target Variable:</h3>
         <div style={{ paddingLeft: "20px" }}>
           <p>The {content.targetVariable.name} indicates whether a mushroom is:</p>
           <ul style={{
             paddingLeft: "30px",
             marginTop: "5px",
             marginBottom: "5px"
           }}>
             {content.targetVariable.classes.map(classInfo => (
               <li key={classInfo.value}>
                 <span style={{ color: classInfo.color }}>
                   '{classInfo.value}'
                 </span>
                 {` - ${classInfo.label} (${classInfo.percentage}%)`}
               </li>
             ))}
           </ul>
         </div>
       </div>
      
       <div style={{ flex: "0 1 35%" }}>
         <h3 style={{ fontWeight: "bold" }}>Dataset Statistics:</h3>
         <div style={{ paddingLeft: "20px" }}>
           <ul style={{ listStyle: "none", padding: 0 }}>
             <li>• Number of features (traits): {content.statistics.numFeatures}</li>
             <li>• Total Number of Mushrooms: {content.statistics.totalRows}</li>
           </ul>
         </div>
       </div>
     </div>


     <div>
       <h3 style={{ fontWeight: "bold" }}>Dataset Preview:</h3>
       <div style={{
         border: "1px solid " + content.styles.tableStyles.borderColor,
         borderRadius: "5px",
         padding: "15px",
         backgroundColor: content.styles.previewBackground,
         maxHeight: "60vh",
         overflow: "auto"
       }}>
         <table style={{
           borderCollapse: "collapse",
           width: "100%",
         }}>
           <thead>
             <tr>
               <th style={{
                 padding: content.styles.tableStyles.cellPadding,
                 backgroundColor: content.styles.tableStyles.headerBackground,
                 borderBottom: "2px solid " + content.styles.tableStyles.borderColor,
                 textAlign: "left",
                 fontWeight: "bold",
                 color: "#495057",
                 width: "250px"
               }}>
                 Feature
               </th>
               {[1, 2, 3].map((num) => (
                 <th key={num} style={{
                   padding: content.styles.tableStyles.cellPadding,
                   backgroundColor: content.styles.tableStyles.headerBackground,
                   borderBottom: "2px solid " + content.styles.tableStyles.borderColor,
                   textAlign: "left",
                   fontWeight: "bold",
                   color: "#495057"
                 }}>
                   Mushroom {num}
                 </th>
               ))}
             </tr>
           </thead>
           <tbody>
             {headers.map((header, rowIndex) => (
               <tr key={rowIndex}>
                 <td style={{
                   padding: content.styles.tableStyles.cellPadding,
                   borderBottom: "1px solid " + content.styles.tableStyles.borderColor,
                   fontWeight: "bold",
                   backgroundColor: content.styles.previewBackground,
                   color: "#333333",
                 }}>
                   {header}
                   {content.features.find(f => f.name === header) && (
                     <span style={{
                       fontSize: "0.8em",
                       color: "#666",
                       display: "block"
                     }}>
                       {content.features.find(f => f.name === header)?.description}
                     </span>
                   )}
                 </td>
                 {firstThreeRows.map((row, colIndex) => (
                   <td key={colIndex} style={{
                     padding: content.styles.tableStyles.cellPadding,
                     borderBottom: "1px solid " + content.styles.tableStyles.borderColor,
                     color: headers[rowIndex] === 'class'
                       ? firstThreeRows[colIndex][rowIndex] === 'p' ? '#dc3545' 
                         : firstThreeRows[colIndex][rowIndex] === 'e' ? '#28a745' 
                         : '#212529'
                       : '#212529'
                   }}>
                     {row[rowIndex]}
                   </td>
                 ))}
               </tr>
             ))}
           </tbody>
         </table>
       </div>
     </div>
   </>
 );
};

