import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ColorLogo from "../../assets/Excel/ColorLogo.png";
import logo3 from "../../assets/Excel/NoviusLogo.png"; // Watermark logo

const DCpdf = async (dcData, projectName, poNumber, description, setIsLoading) => {
  try {
    setIsLoading(true);
    if (!dcData || dcData.length === 0) {
      throw new Error("No DC data available");
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
      
      // Subtitle - DC Schedule
      const subTitle = "DC Schedule";
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
        doc.setFont("helvetica", "normal");
        const pageStr = `Page ${i} of ${pageCount}`;
        doc.text(
          pageStr,
          pageWidth - 14 - doc.getTextWidth(pageStr),
          pageHeight - 10
        );
        doc.setTextColor(80);
        doc.setFont("helvetica", "italic");
        const footerText = `Downloaded by: ${userName} | Download Time: ${formattedDateTime}`;
        doc.text(footerText, 14, pageHeight - 10);
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
    
    // Add table
    const tableColumns = [
      { content: "Sr.No", styles: { halign: "center", fontStyle: "bold" } },
      { content: "Document Name", styles: { halign: "center", fontStyle: "bold" } },
      { content: "Document Reference", styles: { halign: "center", fontStyle: "bold" } },
      { content: "File", styles: { halign: "center", fontStyle: "bold" } },
    ];
    
    const tableBody = dcData.map((doc, index) => [
      { content: index + 1, styles: { halign: "center" } },
      { content: doc.docName || "N/A", styles: { halign: "left" } },
      { content: doc.docReference || "N/A", styles: { halign: "left" } },
      { content: extractFileName(doc.docFilePath) || "N/A", styles: { halign: "left" } },
    ]);
    
    autoTable(doc, {
      startY: lastTableY,
      margin: { left: 10, right: 10 },
      head: [tableColumns],
      body: tableBody,
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
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
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
    const filename = `${safeProjectName} - DC Schedule - ${formattedDateTime}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error("Error generating DC PDF:", error);
    alert(`Failed to generate DC PDF: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

// Extract filename: get part after second "-"
const extractFileName = (filePath) => {
  if (!filePath) return "N/A";
  const baseName = filePath.split(/[\\/]/).pop();
  const parts = baseName.split(" - ");
  return parts.length >= 3 ? parts.slice(2).join(" - ").trim() : baseName;
};

export default DCpdf;