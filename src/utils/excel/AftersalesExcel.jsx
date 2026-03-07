// utils/excel/AftersalesExcel.js
import ExcelJS from "exceljs";
import ColorLogo from "../../assets/Excel/ColorLogo.png";

const AftersalesExcel = async (afterSalesData, setLoading, triggerNotification, projectName) => {
  try {
    setLoading(true);
    if (!afterSalesData || afterSalesData.length === 0) {
      throw new Error("No After Sales data available for export");
    }

    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("After Sales");

    // Header: Logo in A1, Title in B1:G1
    try {
      const colorLogoBuffer = await fetch(ColorLogo).then((res) => {
        if (!res.ok) throw new Error("Failed to fetch ColorLogo.png");
        return res.arrayBuffer();
      });

      const colorLogoId = workbook.addImage({
        buffer: colorLogoBuffer,
        extension: "png",
      });

      worksheet.addImage(colorLogoId, {
        tl: { col: 0.3, row: 0.1 },
        ext: { width: 100, height: 50 },
      });

      worksheet.mergeCells("B1:G1");
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
      console.error("Error loading logo:", error);
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

    // Form Title
    worksheet.mergeCells("A2:G2");
    worksheet.getCell("A2").value = "AFTER SALES SR COMPLAINTS";
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

    // Footer: Downloaded by & Time
    const userName = JSON.parse(localStorage.getItem("user"))?.username || "Guest";
    const downloadDate = new Date();
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

    // Section Header: After Sales SR Details
    const sectionHeader = worksheet.addRow(["After Sales SR Details"]);
    worksheet.mergeCells("A5:G5");
    sectionHeader.getCell(1).font = {
      bold: true,
      size: 14,
      name: "Calibri",
    };
    sectionHeader.getCell(1).alignment = {
      horizontal: "left",
      vertical: "middle",
    };
    worksheet.getRow(5).height = 25;

    worksheet.addRow([]); // Spacer (Row 6)

    // Table Headers
    const tableHeader = worksheet.addRow(["Sr.No", "Document Name", "", "Document Reference", "", "File", ""]);
    worksheet.mergeCells("A7:A7");           // Sr.No
    worksheet.mergeCells("B7:C7");           // Document Name
    worksheet.mergeCells("D7:E7");           // Document Reference
    worksheet.mergeCells("F7:G7");           // File

    // Shared header style
    const headerStyle = {
      font: { bold: true, size: 12, name: "Helvetica" },
      alignment: { horizontal: "center", vertical: "middle" },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "808080" },
      },
      border: {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      },
    };

    worksheet.getCell("A7").value = "Sr.No";
    Object.assign(worksheet.getCell("A7"), headerStyle);

    worksheet.getCell("B7").value = "Document Name";
    Object.assign(worksheet.getCell("B7"), headerStyle);

    worksheet.getCell("D7").value = "Document Reference";
    Object.assign(worksheet.getCell("D7"), headerStyle);

    worksheet.getCell("F7").value = "File";
    Object.assign(worksheet.getCell("F7"), headerStyle);

    worksheet.getRow(7).height = 25;

    // Add data rows
    afterSalesData.forEach((doc, index) => {
      const rowIndex = 8 + index;
      const fileName = doc.docFilePath ? extractFileName(doc.docFilePath) : "N/A";

      worksheet.addRow([
        index + 1,
        doc.docName || "N/A",
        "",
        doc.docReference || "N/A",
        "",
        "View File",
        ""
      ]);

      // Merge cells
      worksheet.mergeCells(`B${rowIndex}:C${rowIndex}`); // Document Name
      worksheet.mergeCells(`D${rowIndex}:E${rowIndex}`); // Document Reference
      worksheet.mergeCells(`F${rowIndex}:G${rowIndex}`); // File

      // Shared cell style
      const cellStyle = {
        border: {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        },
        alignment: { vertical: "middle" },
      };

      // Sr.No
      worksheet.getCell(`A${rowIndex}`).alignment = { ...cellStyle.alignment, horizontal: "center" };
      worksheet.getCell(`A${rowIndex}`).border = cellStyle.border;

      // Document Name
      worksheet.getCell(`B${rowIndex}`).alignment = { ...cellStyle.alignment, horizontal: "left" };
      worksheet.getCell(`B${rowIndex}`).border = cellStyle.border;

      // Document Reference
      worksheet.getCell(`D${rowIndex}`).alignment = { ...cellStyle.alignment, horizontal: "left" };
      worksheet.getCell(`D${rowIndex}`).border = cellStyle.border;

      // File (View File)
      worksheet.getCell(`F${rowIndex}`).value = "View File";
      worksheet.getCell(`F${rowIndex}`).alignment = { ...cellStyle.alignment, horizontal: "center" };
      worksheet.getCell(`F${rowIndex}`).border = cellStyle.border;
      worksheet.getCell(`F${rowIndex}`).font = {
        color: { argb: "007BFF" },
        underline: true,
      };
    });

    // Set column widths
    worksheet.columns = [
      { width: 10 }, // A - Sr.No
      { width: 25 }, // B - Document Name
      { width: 8 },  // C
      { width: 25 }, // D - Document Reference
      { width: 8 },  // E
      { width: 15 }, // F - File
      { width: 15 }, // G
    ];

    // Generate filename
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')} ${today.toLocaleDateString('en-US', { month: 'short' })} ${today.getFullYear()} ${today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    const excelFileName = `${projectName || 'Project'} - After Sales - ${dateStr}.xlsx`;

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

// Helper function to extract filename after second "-"
const extractFileName = (filePath) => {
  const baseName = filePath.split(/[\\/]/).pop();
  const parts = baseName.split(" - ");
  return parts.length >= 3 ? parts.slice(2).join(" - ").trim() : baseName;
};

export default AftersalesExcel;