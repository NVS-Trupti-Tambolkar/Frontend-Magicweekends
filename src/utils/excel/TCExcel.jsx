import ExcelJS from "exceljs";
import ColorLogo from "../../assets/Excel/ColorLogo.png";

const TCExcel = async (tcData, setLoading, triggerNotification, projectName) => {
  try {
    setLoading(true);
    if (!tcData) {
      throw new Error("No Test Certificate data available for export");
    }
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Test Certificate");
    
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
    worksheet.getCell("A2").value = "TEST CERTIFICATE";
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
    
    // Test Certificate Details Header (Row 5)
    const tcHeaderRow = worksheet.addRow(["Test Certificate Details"]);
    worksheet.mergeCells("A5:G5");
    tcHeaderRow.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
    tcHeaderRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(5).height = 25;
    
    worksheet.addRow([]); // Spacer (Row 6)
    
    // Test Certificate Table Headers - FIXED: Properly set headers with correct merging
    const tcTableHeaderRow = worksheet.addRow(["Field", "", "", "", "Value", "", ""]);
    worksheet.mergeCells("A7:D7"); // Field header spans A7 to D7
    worksheet.mergeCells("E7:G7"); // Value header spans E7 to G7
    
    // Apply formatting to the header cells only
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
    
    worksheet.getCell("E7").font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell("E7").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell("E7").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell("E7").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    
    worksheet.getRow(7).height = 25;
    
    // Test Certificate Data - Fixed to properly display values
    const { tcForm } = tcData;
    const tcFormData = [
      ["Test Certificate Number", tcForm.TestCertificateNumber || "N/A"],
      ["Material Name", tcForm.MaterialName || "N/A"],
      ["Material Grade", tcForm.MaterialGrade || "N/A"],
      ["Test Date", tcForm.TestDate ? new Date(tcForm.TestDate).toLocaleDateString() : "N/A"],
    ];
    
    tcFormData.forEach((rowData, index) => {
      const rowIndex = 8 + index;
      // Add the row with field name in first cell and value in fifth cell (E column)
      const row = worksheet.addRow([rowData[0], "", "", "", rowData[1], "", ""]);
      // Merge cells for field name
      worksheet.mergeCells(`A${rowIndex}:D${rowIndex}`);
      // Merge cells for value
      worksheet.mergeCells(`E${rowIndex}:G${rowIndex}`);
      // Apply formatting to the merged cells
      worksheet.getCell(`A${rowIndex}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(`A${rowIndex}`).alignment = { horizontal: "left", vertical: "middle" };
      worksheet.getCell(`E${rowIndex}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(`E${rowIndex}`).alignment = { horizontal: "left", vertical: "middle" };
    });
    
    // Add spacer before TC Documents
    const lastTcRow = 8 + tcFormData.length;
    worksheet.addRow([]); // Spacer row
    
    // TC Documents Section Header
    const tcDocumentsHeaderRow = worksheet.addRow(["TC Documents"]);
    worksheet.mergeCells(`A${lastTcRow + 2}:G${lastTcRow + 2}`);
    tcDocumentsHeaderRow.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
    tcDocumentsHeaderRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(lastTcRow + 2).height = 25;
    
    worksheet.addRow([]); // Spacer row
    
    // TC Documents Table Headers
    const tcDocumentsTableHeaderRow = worksheet.addRow(["S.No", "Document Name", "Document Reference", "File", "", "", ""]);
    worksheet.mergeCells(`D${lastTcRow + 4}:G${lastTcRow + 4}`); // File header spans D to G
    
    // Apply formatting to the header cells
    worksheet.getCell(`A${lastTcRow + 4}`).font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell(`A${lastTcRow + 4}`).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`A${lastTcRow + 4}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell(`A${lastTcRow + 4}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    
    worksheet.getCell(`B${lastTcRow + 4}`).font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell(`B${lastTcRow + 4}`).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`B${lastTcRow + 4}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell(`B${lastTcRow + 4}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    
    worksheet.getCell(`C${lastTcRow + 4}`).font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell(`C${lastTcRow + 4}`).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`C${lastTcRow + 4}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell(`C${lastTcRow + 4}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    
    worksheet.getCell(`D${lastTcRow + 4}`).font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell(`D${lastTcRow + 4}`).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`D${lastTcRow + 4}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell(`D${lastTcRow + 4}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    
    worksheet.getRow(lastTcRow + 4).height = 25;
    
    // TC Documents Data
    const { tcDocuments } = tcData;
    tcDocuments.forEach((doc, index) => {
      const rowIndex = lastTcRow + 5 + index;
      const row = worksheet.addRow([
        index + 1,
        doc.docName || "N/A",
        doc.docReference || "N/A",
        doc.filePath ? "View File" : "No file",
        "", "", ""
      ]);
      
      // Merge cells for file column
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
      worksheet.getCell(`D${rowIndex}`).alignment = { horizontal: "center", vertical: "middle" };
    });
    
    // Add spacer before TPI Documents
    const lastTcDocumentRow = lastTcRow + 5 + tcDocuments.length;
    worksheet.addRow([]); // Spacer row
    
    // TPI Documents Section Header
    const tpiDocumentsHeaderRow = worksheet.addRow(["TPI (Third Party Inspection) Documents"]);
    worksheet.mergeCells(`A${lastTcDocumentRow + 2}:G${lastTcDocumentRow + 2}`);
    tpiDocumentsHeaderRow.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
    tpiDocumentsHeaderRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(lastTcDocumentRow + 2).height = 25;
    
    worksheet.addRow([]); // Spacer row
    
    // TPI Documents Table Headers
    const tpiDocumentsTableHeaderRow = worksheet.addRow(["S.No", "Document Name", "Document Reference", "File", "", "", ""]);
    worksheet.mergeCells(`D${lastTcDocumentRow + 4}:G${lastTcDocumentRow + 4}`); // File header spans D to G
    
    // Apply formatting to the header cells
    worksheet.getCell(`A${lastTcDocumentRow + 4}`).font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell(`A${lastTcDocumentRow + 4}`).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`A${lastTcDocumentRow + 4}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell(`A${lastTcDocumentRow + 4}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    
    worksheet.getCell(`B${lastTcDocumentRow + 4}`).font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell(`B${lastTcDocumentRow + 4}`).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`B${lastTcDocumentRow + 4}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell(`B${lastTcDocumentRow + 4}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    
    worksheet.getCell(`C${lastTcDocumentRow + 4}`).font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell(`C${lastTcDocumentRow + 4}`).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`C${lastTcDocumentRow + 4}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell(`C${lastTcDocumentRow + 4}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    
    worksheet.getCell(`D${lastTcDocumentRow + 4}`).font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell(`D${lastTcDocumentRow + 4}`).alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell(`D${lastTcDocumentRow + 4}`).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell(`D${lastTcDocumentRow + 4}`).border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    
    worksheet.getRow(lastTcDocumentRow + 4).height = 25;
    
    // TPI Documents Data
    const { tpiDocuments } = tcData;
    tpiDocuments.forEach((doc, index) => {
      const rowIndex = lastTcDocumentRow + 5 + index;
      const row = worksheet.addRow([
        index + 1,
        doc.docName || "N/A",
        doc.docReference || "N/A",
        doc.filePath ? "View File" : "No file",
        "", "", ""
      ]);
      
      // Merge cells for file column
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
      worksheet.getCell(`D${rowIndex}`).alignment = { horizontal: "center", vertical: "middle" };
    });
    
    // Set column widths
    worksheet.columns = [
      { width: 8 },   // A - S.No
      { width: 30 },  // B - Document Name
      { width: 20 },  // C - Document Reference
      { width: 15 },  // D - File
      { width: 15 },  // E
      { width: 15 },  // F
      { width: 15 },  // G
    ];
    
    // Generate filename with project name and today's date
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')} ${today.toLocaleDateString('en-US', { month: 'short' })} ${today.getFullYear()} ${today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    const excelFileName = `${projectName || 'Project'} - Test Certificate - ${dateStr}.xlsx`;
    
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

export default TCExcel;