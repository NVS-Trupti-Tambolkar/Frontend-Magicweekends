import ExcelJS from "exceljs";
import ColorLogo from "../../assets/Excel/ColorLogo.png";

const SiteLayoutExcel = async (siteLayoutData, setLoading, triggerNotification, projectName) => {
  try {
    setLoading(true);
    if (!siteLayoutData) {
      throw new Error("No Site Layout data available for export");
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Site Layout");

    // Header layout with logo in first column only and title in merged remaining columns
    try {
      // Fetch ColorLogo image
      const colorLogoBuffer = await fetch(ColorLogo).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch ColorLogo.png");
        return res.arrayBuffer();
      });

      // Add image to workbook
      const colorLogoId = workbook.addImage({
        buffer: colorLogoBuffer,
        extension: "png",
      });

      // Add logo at A1 only - centered in the cell
      worksheet.addImage(colorLogoId, {
        tl: { col: 0.3, row: 0.1 }, // Adjusted position for centering
        ext: { width: 100, height: 50 },
      });

      // Merge remaining columns for title (B1:G1)
      worksheet.mergeCells("B1:G1");

      // Add "Novius Business System" in the merged cells - centered
      worksheet.getCell("B1").value = "Novius Business System";
      worksheet.getCell("B1").font = {
        bold: true,
        size: 16,
        name: "Helvetica",
      };
      worksheet.getCell("B1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getRow(1).height = 60;
    } catch (error) {
      console.error("Error loading logo images:", error);
      // Fallback: Centered text if logo fails
      worksheet.mergeCells("A1:G1");
      worksheet.getCell("A1").value = "Novius Business System";
      worksheet.getCell("A1").font = {
        bold: true,
        size: 16,
        name: "Helvetica",
      };
      worksheet.getCell("A1").alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getRow(1).height = 40;
    }

    // Add form heading below (Row 2)
    worksheet.mergeCells("A2:G2");
    worksheet.getCell("A2").value = "SITE LAYOUT DETAILS";
    worksheet.getCell("A2").font = {
      bold: true,
      size: 14,
      name: "Helvetica",
    };
    worksheet.getCell("A2").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    worksheet.getRow(2).height = 25;

    // Footer: Downloaded by & time (Row 3)
    const userName = JSON.parse(localStorage.getItem("user"))?.username || "Guest";
    const downloadDate = new Date();
    // Format date as "03 Sep 2025 02:37 PM"
    const formattedDateTime = `${downloadDate.getDate().toString().padStart(2, '0')} ${downloadDate.toLocaleDateString('en-US', { month: 'short' })} ${downloadDate.getFullYear()} ${downloadDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    
    worksheet.getCell("A3").value = `Downloaded by: ${userName}`;
    worksheet.getCell("A3").font = {
      bold: true,
      size: 10,
      name: "Helvetica",
      italic: true,
    };
    worksheet.getCell("A3").alignment = {
      horizontal: "left",
      vertical: "middle",
    };
    
    worksheet.getCell("G3").value = `Download Time: ${formattedDateTime}`;
    worksheet.getCell("G3").font = {
      bold: true,
      size: 10,
      name: "Helvetica",
      italic: true,
    };
    worksheet.getCell("G3").alignment = {
      horizontal: "right",
      vertical: "middle",
    };
    worksheet.getRow(3).height = 20;

    worksheet.addRow([]); // Spacer (Row 4)

    // General Documents Table Header (Row 5)
    const generalHeaderRow = worksheet.addRow(["General Documents"]);
    worksheet.mergeCells("A5:G5");
    generalHeaderRow.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
    generalHeaderRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(5).height = 25;

    worksheet.addRow([]); // Spacer (Row 6)

    // General Documents Table Headers
    const generalTableHeaderRow = worksheet.addRow(["S.No", "Document Name", "Document Reference", "File Path", "", "", ""]);
    worksheet.mergeCells("D7:G7"); // File Path header spans D7 to G7

    // Apply formatting to the header cells
    worksheet.getCell("A7").font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell("A7").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell("A7").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell("A7").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    worksheet.getCell("B7").font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell("B7").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell("B7").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell("B7").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    worksheet.getCell("C7").font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell("C7").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell("C7").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell("C7").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    worksheet.getCell("D7").font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell("D7").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell("D7").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell("D7").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    worksheet.getRow(7).height = 25;

    // General Documents Data
    const generalDocuments = siteLayoutData.generalDocuments || [];
    generalDocuments.forEach((doc, index) => {
      const rowIndex = 8 + index;
      const row = worksheet.addRow([
        index + 1,
        doc.DocName || "N/A",
        doc.DocReference || "N/A",
        doc.DocFilePath || "N/A",
        "", "", ""
      ]);
      
      // Merge cells for file path
      worksheet.mergeCells(`D${rowIndex}:G${rowIndex}`);
      
      // Apply formatting to the cells
      worksheet.getCell(`A${rowIndex}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: "center", vertical: "middle" };
      
      worksheet.getCell(`B${rowIndex}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(`B${rowIndex}`).alignment = { horizontal: "left", vertical: "middle" };
      
      worksheet.getCell(`C${rowIndex}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(`C${rowIndex}`).alignment = { horizontal: "left", vertical: "middle" };
      
      worksheet.getCell(`D${rowIndex}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(`D${rowIndex}`).alignment = { horizontal: "left", vertical: "middle" };
    });

    // Add spacer before Joint Survey Documents
    const lastGeneralRow = 8 + generalDocuments.length;
    worksheet.addRow([]); // Spacer row

    // Joint Survey Documents Table Header
    const jointSurveyHeaderRow = worksheet.addRow(["Joint Survey Documents"]);
    worksheet.mergeCells(`A${lastGeneralRow + 2}:G${lastGeneralRow + 2}`);
    jointSurveyHeaderRow.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
    jointSurveyHeaderRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(lastGeneralRow + 2).height = 25;

    worksheet.addRow([]); // Spacer row

    // Joint Survey Documents Table Headers
    const jointSurveyTableHeaderRow = worksheet.addRow(["S.No", "Document Name", "Document Reference", "File Path", "", "", ""]);
    worksheet.mergeCells(`D${lastGeneralRow + 4}:G${lastGeneralRow + 4}`); // File Path header spans D to G

    // Apply formatting to the header cells
    worksheet.getCell(`A${lastGeneralRow + 4}`).font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell(`A${lastGeneralRow + 4}`).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`A${lastGeneralRow + 4}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell(`A${lastGeneralRow + 4}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    worksheet.getCell(`B${lastGeneralRow + 4}`).font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell(`B${lastGeneralRow + 4}`).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`B${lastGeneralRow + 4}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell(`B${lastGeneralRow + 4}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    worksheet.getCell(`C${lastGeneralRow + 4}`).font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell(`C${lastGeneralRow + 4}`).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`C${lastGeneralRow + 4}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell(`C${lastGeneralRow + 4}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    worksheet.getCell(`D${lastGeneralRow + 4}`).font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell(`D${lastGeneralRow + 4}`).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`D${lastGeneralRow + 4}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell(`D${lastGeneralRow + 4}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    worksheet.getRow(lastGeneralRow + 4).height = 25;

    // Joint Survey Documents Data
    const jointSurveyDocuments = siteLayoutData.jointSurveyDocuments || [];
    jointSurveyDocuments.forEach((doc, index) => {
      const rowIndex = lastGeneralRow + 5 + index;
      const row = worksheet.addRow([
        index + 1,
        doc.JointSurveyDocName || "N/A",
        doc.JointSurveyDocReference || "N/A",
        doc.JointSurveyDocFilePath || "N/A",
        "", "", ""
      ]);
      
      // Merge cells for file path
      worksheet.mergeCells(`D${rowIndex}:G${rowIndex}`);
      
      // Apply formatting to the cells
      worksheet.getCell(`A${rowIndex}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: "center", vertical: "middle" };
      
      worksheet.getCell(`B${rowIndex}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(`B${rowIndex}`).alignment = { horizontal: "left", vertical: "middle" };
      
      worksheet.getCell(`C${rowIndex}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(`C${rowIndex}`).alignment = { horizontal: "left", vertical: "middle" };
      
      worksheet.getCell(`D${rowIndex}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(`D${rowIndex}`).alignment = { horizontal: "left", vertical: "middle" };
    });

    // Set column widths
    worksheet.columns = [
      { width: 8 },   // A - S.No
      { width: 30 },  // B - Document Name
      { width: 20 },  // C - Document Reference
      { width: 40 },  // D - File Path
      { width: 10 },  // E
      { width: 10 },  // F
      { width: 10 },  // G
    ];

    // Generate filename with project name and today's date
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')} ${today.toLocaleDateString('en-US', { month: 'short' })} ${today.getFullYear()} ${today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    const excelFileName = `${projectName || 'Project'} - Site Layout - ${dateStr}.xlsx`;

    // Generate and download Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = excelFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    triggerNotification("Excel generated successfully", "success"); 
  } catch (error) {
    console.error("Error generating Excel:", error);
    triggerNotification(`Failed to generate Excel: ${error.message}`, "error");
  } finally {
    setLoading(false);
  }
};

export default SiteLayoutExcel;