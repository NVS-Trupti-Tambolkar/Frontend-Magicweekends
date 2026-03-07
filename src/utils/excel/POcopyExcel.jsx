import ExcelJS from "exceljs";
import ColorLogo from "../../assets/Excel/ColorLogo.png";

const POcopyExcel = async (poData, setLoading, triggerNotification, projectName) => {
  try {
    setLoading(true);
    if (!poData) {
      throw new Error("No PO data available for export");
    }
    const { poData: poDetails, customers } = poData;
    const poInfo = poDetails[0];
    
    // Create workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("PO Details");
    
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
    worksheet.getCell("A2").value = "PURCHASE ORDER DETAILS";
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
    
    // PO Details Table Header (Row 5)
    const poHeaderRow = worksheet.addRow(["PO Details"]);
    worksheet.mergeCells("A5:G5");
    poHeaderRow.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
    poHeaderRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(5).height = 25;
    
    worksheet.addRow([]); // Spacer (Row 6)
    
    // PO Details Table Headers - FIXED: Properly set headers with correct merging
    const poTableHeaderRow = worksheet.addRow(["Field", "", "", "", "Value", "", ""]);
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
    
    // PO Details Data - Fixed to properly display values
    const poDataRows = [
      ["PO Number", poInfo.PoNumber || ""],
      ["PO Date", poInfo.PoDate ? new Date(poInfo.PoDate).toLocaleDateString() : ""],
      ["Description", poInfo.Description || ""],
      ["Unit & Location", poInfo.UnitLocation || ""],
      ["File", poInfo.UploadedFile ? poInfo.UploadedFile.split("/").pop() : ""],
    ];
    
    poDataRows.forEach((rowData, index) => {
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
    
    worksheet.addRow([]); // Spacer
    worksheet.addRow([]); // Spacer
    
    // Customer Details Header (Row 14)
    const customerHeaderRow = worksheet.addRow(["Customer Details"]);
    worksheet.mergeCells("A14:G14");
    customerHeaderRow.getCell(1).font = { bold: true, size: 14, name: "Calibri" };
    customerHeaderRow.getCell(1).alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(14).height = 25;
    
    worksheet.addRow([]); // Spacer (Row 15)
    
    // Customer Table Headers - FIXED: Add empty row first, then set values and merge
    worksheet.addRow(["", "", "", "", "", "", ""]); // Add empty row first
    
    // Set header values before merging
    worksheet.getCell("A16").value = "Customer Name";
    worksheet.getCell("D16").value = "Email";
    worksheet.getCell("F16").value = "Contact No";
    
    // Merge cells after setting values
    worksheet.mergeCells("A16:C16"); // Name
    worksheet.mergeCells("D16:E16"); // Email
    worksheet.mergeCells("F16:G16"); // Contact
    
    // Apply formatting to customer table headers
    ["A16", "D16", "F16"].forEach(cellRef => {
      const cell = worksheet.getCell(cellRef);
      cell.font = { bold: true, size: 12, name: "Helvetica" };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "808080" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    worksheet.getRow(16).height = 25;
    
    // Customer Data - FIXED: Add data first, then merge and format
    customers.forEach((customer, index) => {
      const rowIndex = 17 + index;
      
      // Add the customer data to the correct starting columns
      worksheet.getCell(`A${rowIndex}`).value = customer.Customer_Name || "";
      worksheet.getCell(`D${rowIndex}`).value = customer.Customer_email || "";
      worksheet.getCell(`F${rowIndex}`).value = customer.Customer_ContactNo || "";
      
      // Merge cells to match header structure
      worksheet.mergeCells(`A${rowIndex}:C${rowIndex}`); // Name
      worksheet.mergeCells(`D${rowIndex}:E${rowIndex}`); // Email
      worksheet.mergeCells(`F${rowIndex}:G${rowIndex}`); // Contact
      
      // Apply formatting to each merged section
      ["A", "D", "F"].forEach(col => {
        const cell = worksheet.getCell(`${col}${rowIndex}`);
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });
      
      // Set row height
      worksheet.getRow(rowIndex).height = 20;
    });
    
    // Set column widths
    worksheet.columns = [
      { width: 25 }, // A
      { width: 8 },  // B
      { width: 8 },  // C
      { width: 20 }, // D - Email
      { width: 10 }, // E
      { width: 15 }, // F - Contact
      { width: 15 }, // G
    ];
    
    // Generate filename with project name and today's date
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')} ${today.toLocaleDateString('en-US', { month: 'short' })} ${today.getFullYear()} ${today.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    const excelFileName = `${projectName || 'Project'} - PO Copy - ${dateStr}.xlsx`;
    
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

export default POcopyExcel;