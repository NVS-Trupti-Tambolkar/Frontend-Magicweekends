import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ColorLogo from "../../assets/Excel/ColorLogo.png";
import logo3 from "../../assets/Excel/NoviusLogo.png"; // Watermark logo

const POcopyPdf = async (poData, projectName, poNumber, description, setIsLoading) => {
  try {
    setIsLoading(true);
    if (!poData) {
      throw new Error("No PO Copy data available");
    }

    const { poData: poDetails, customers } = poData;
    const poInfo = poDetails[0];

    const user = JSON.parse(localStorage.getItem("user"));
    const userName = user?.username || "Guest";
    const downloadDate = new Date();

    // Format date as "05 Sep 2025 05_53 PM"
    const formatDate = (date) => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${day} ${month} ${year} ${hours}_${minutes} ${ampm}`;
    };

    const formattedDateTime = formatDate(downloadDate);
    const doc = new jsPDF({ orientation: "portrait" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const addHeader = () => {
      doc.setTextColor(0, 0, 0);
      if (ColorLogo) {
        const logoX = 10;
        const logoY = 5;
        const logoW = 35;
        const logoH = 15; // Adjusted to match other forms
        doc.addImage(ColorLogo, "PNG", logoX, logoY, logoW, logoH);
        doc.link(logoX, logoY, logoW, logoH, {
          url: "https://noviusrailtech.com/",
        });
      }

      // Main title - Novius Business System
      const mainTitle = "Novius Business System";
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const mainTitleWidth = doc.getTextWidth(mainTitle);
      const mainTitleX = (pageWidth - mainTitleWidth) / 2;
      doc.text(mainTitle, mainTitleX, 15);

      // Subtitle - PO Copy
      const subTitle = "PO Copy";
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      const subTitleWidth = doc.getTextWidth(subTitle);
      const subTitleX = (pageWidth - subTitleWidth) / 2;
      doc.text(subTitle, subTitleX, 22);

      doc.setDrawColor(200, 200, 200);
      doc.line(10, 28, pageWidth - 10, 28);
    };

    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic", "bold");

        // Left side - Downloaded by
        const leftText = `Downloaded by: ${userName}`;
        doc.text(leftText, 14, pageHeight - 10);

        // Right side - Download Time
        const rightText = `Download Time: ${formattedDateTime}`;
        doc.text(rightText, pageWidth - doc.getTextWidth(rightText) - 14, pageHeight - 10);
      }
    };

    const addWatermark = () => {
      if (logo3) {
        const watermarkWidth = 150;
        const watermarkHeight = 100;
        const watermarkX = (pageWidth - watermarkWidth) / 2;
        const watermarkY = (pageHeight - watermarkHeight) / 2;
        doc.saveGraphicsState();
        doc.setGState(new doc.GState({ opacity: 0.08 }));
        doc.addImage(logo3, "PNG", watermarkX, watermarkY, watermarkWidth, watermarkHeight);
        doc.restoreGraphicsState();
      }
    };

    // Add initial header
    addHeader();
    let lastTableY = 40;

    // Add section header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("PO Details", 14, lastTableY);
    lastTableY += 15;

    // Prepare PO details table data
    const poTableData = [
      ["PO Number", poInfo.PoNumber || "N/A"],
      ["PO Date", poInfo.PoDate ? new Date(poInfo.PoDate).toLocaleDateString() : "N/A"],
      ["Description", poInfo.Description || "N/A"],
      ["Unit & Location", poInfo.UnitLocation || "N/A"]
    ];

    // Extract filename from path
    const extractFileName = (filePath) => {
      if (!filePath) return "N/A";
      const baseName = filePath.split(/[\\/]/).pop();
      const parts = baseName.split(" - ");
      return parts.length >= 3 ? parts.slice(2).join(" - ").trim() : baseName;
    };

    // Add PO details table
    autoTable(doc, {
      startY: lastTableY,
      margin: { left: 14, right: 14 },
      head: [],
      body: poTableData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 5,
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
        halign: "left",
        valign: "middle",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didDrawPage: (data) => {
        if (data.pageNumber === 1) {
          addHeader();
        }
        addWatermark();
      },
    });

    // Update lastTableY after PO details table
    lastTableY = doc.lastAutoTable.finalY + 15;

    // Add file info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("File", 14, lastTableY);
    lastTableY += 8;
    doc.setFont("helvetica", "normal");
    doc.text(extractFileName(poInfo.UploadedFile), 14, lastTableY);
    lastTableY += 15;

    // Add Customer Details header
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Details", 14, lastTableY);
    lastTableY += 15;

    // Prepare customer table data
    const customerTableData = customers.map(customer => [
      customer.Customer_Name || "N/A",
      customer.Customer_email || "N/A",
      customer.Customer_ContactNo || "N/A"
    ]);

    // Add customer table
    autoTable(doc, {
      startY: lastTableY,
      margin: { left: 14, right: 14 },
      head: [["Customer Name", "Email", "Contact No"]],
      body: customerTableData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 5,
        textColor: [0, 0, 0],
        fillColor: [255, 255, 255],
        halign: "center",
        valign: "middle",
      },
      headStyles: {
        fillColor: [128, 128, 128], // Gray color matching Excel
        textColor: [255, 255, 255], // White text
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didDrawPage: (data) => {
        addWatermark();
      },
    });

    addFooter();

    // Format filename: projectname - formname - downloaded date
    const sanitizeFilename = (str) => {
      return str.replace(/[\\/:*?"<>|]/g, '_').trim();
    };

    const safeProjectName = sanitizeFilename(projectName || "Project");
    const filename = `${safeProjectName} - PO Copy - ${formattedDateTime}.pdf`;

    doc.save(filename);
  } catch (error) {
    console.error("Error generating PO Copy PDF:", error);
    alert(`Failed to generate PO Copy PDF: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

export default POcopyPdf;