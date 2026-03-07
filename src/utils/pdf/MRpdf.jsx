import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ColorLogo from "../../assets/Excel/ColorLogo.png";
import logo3 from "../../assets/Excel/NoviusLogo.png"; // Watermark logo

const MRpdf = async (mrData, projectName, poNumber, description, setIsLoading) => {
  try {
    setIsLoading(true);
    if (!mrData) {
      throw new Error("No MR data available");
    }
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
    const logoWidth = 18;
    const logoHeight = 15;
    
    const addHeader = () => {
      doc.setTextColor(0, 0, 0);
      if (ColorLogo) {
        const logoX = 10;
        const logoY = 5;
        const logoW = 35;
        const logoH = logoHeight;
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
      
      // Subtitle - Material Requisition
      const subTitle = "Material Requisition";
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
    doc.text("MR Details", 14, lastTableY);
    lastTableY += 15;
    
    // Format MR data for table
    const formatLabel = (str) => {
      return str
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase());
    };
    
    // Filter out unwanted fields and format date fields
    const filteredData = Object.entries(mrData)
      .filter(([key]) => !["ID", "POID", "ProjectID", "Deleted", "DateofCreation", "DateofModification"].includes(key))
      .map(([key, value]) => {
        let formattedValue = value;
        if (value) {
          if (key.includes("Date") || key === "ExpectedDeliveryDate" || key === "ActualDeliveryDate") {
            formattedValue = new Date(value).toLocaleDateString();
          }
        } else {
          formattedValue = "N/A";
        }
        return [formatLabel(key), formattedValue];
      });
    
    // Calculate column widths to use full container width
    const tableMargin = 10; // Left and right margin
    const availableWidth = pageWidth - (tableMargin * 2);
    const fieldColumnWidth = availableWidth * 0.35; // 35% for Field column
    const valueColumnWidth = availableWidth * 0.65; // 65% for Value column
    
    // Add table
    const tableColumns = [
      { content: "Field", styles: { halign: "center", fontStyle: "bold" } },
      { content: "Value", styles: { halign: "center", fontStyle: "bold" } },
    ];
    
    autoTable(doc, {
      startY: lastTableY,
      margin: { left: tableMargin, right: tableMargin },
      tableWidth: availableWidth, // Use full available width
      head: [tableColumns],
      body: filteredData,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
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
      columnStyles: {
        0: { cellWidth: fieldColumnWidth, halign: "center" }, // Field column - left aligned
        1: { cellWidth: valueColumnWidth, halign: "center" }, // Value column - left aligned
      },
      didDrawPage: () => {
        addHeader();
        addWatermark();
      },
    });
    
    addFooter();
    
    // Format filename: projectname - formname - downloaded date
    const sanitizeFilename = (str) => {
      return str.replace(/[\\/:*?"<>|]/g, '_').trim();
    };
    
    const safeProjectName = sanitizeFilename(projectName || "Project");
    const filename = `${safeProjectName} - Material Requisition - ${formattedDateTime}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error("Error generating MR PDF:", error);
    alert(`Failed to generate MR PDF: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

export default MRpdf;