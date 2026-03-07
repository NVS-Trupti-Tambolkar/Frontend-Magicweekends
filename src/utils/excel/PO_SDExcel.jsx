import ExcelJS from "exceljs";
import ColorLogo from "../../assets/Excel/ColorLogo.png";

const PO_SDExcel = async (sdData, setLoading, triggerNotification, poNumber, projectName) => {
  try {
    setLoading(true);
    if (!sdData) {
      throw new Error("No SD data available for export");
    }
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Security Deposit");
    
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
    worksheet.getCell("A2").value = "SECURITY DEPOSIT";
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
    
    // SD Table Header (Row 5)
    const sdHeaderRow = worksheet.addRow(["Security Deposit Details"]);
    worksheet.mergeCells("A5:G5");
    sdHeaderRow.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
    sdHeaderRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(5).height = 25;
    
    worksheet.addRow([]); // Spacer (Row 6)
    
    // SD Table Headers
    const sdTableHeaderRow = worksheet.addRow(["S.No", "Document Name", "Document Reference", "File"]);
    worksheet.mergeCells("A7:A7"); // S.No header
    worksheet.mergeCells("B7:C7"); // Document Name header spans B7 to C7
    worksheet.mergeCells("D7:E7"); // Document Reference header spans D7 to E7
    worksheet.mergeCells("F7:G7"); // File header spans F7 to G7
    
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
    
    worksheet.getCell("F7").font = { bold: true, size: 12, name: "Helvetica" };
    worksheet.getCell("F7").alignment = { horizontal: "center", vertical: "middle" };
    worksheet.getCell("F7").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "808080" },
    };
    worksheet.getCell("F7").border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };
    
    worksheet.getRow(7).height = 25;
    
    // SD Data
    sdData.forEach((doc, index) => {
      const rowIndex = 8 + index;
      // Add the row with document details
      const row = worksheet.addRow([
        index + 1,
        doc.docName,
        "",
        doc.docReference,
        "",
        "View File",
        ""
      ]);
      
      // Merge cells for proper formatting
      worksheet.mergeCells(`B${rowIndex}:C${rowIndex}`); // Document Name
      worksheet.mergeCells(`D${rowIndex}:E${rowIndex}`); // Document Reference
      worksheet.mergeCells(`F${rowIndex}:G${rowIndex}`); // File
      
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
      
      worksheet.getCell(`D${rowIndex}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(`D${rowIndex}`).alignment = { horizontal: "left", vertical: "middle" };
      
      worksheet.getCell(`F${rowIndex}`).border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
      worksheet.getCell(`F${rowIndex}`).alignment = { horizontal: "center", vertical: "middle" };
      worksheet.getCell(`F${rowIndex}`).font = {
        color: { argb: "007BFF" },
        underline: true,
      };
    });
    
    // Set column widths
    worksheet.columns = [
      { width: 10 }, // A - S.No
      { width: 25 }, // B - Document Name
      { width: 8 },  // C
      { width: 25 }, // D - Document Reference
      { width: 8 },  // E
      { width: 15 }, // F - File
      { width: 15 }, // G
    ];
    
    // Generate filename with project name and today's date
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')} ${today.toLocaleDateString('en-US', { month: 'short' })} ${today.getFullYear()} ${today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    const excelFileName = `${projectName || 'Project'} - Security Deposit - ${dateStr}.xlsx`;
    
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

export default PO_SDExcel;