import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ColorLogo from "../../assets/Excel/ColorLogo.png";
import logo3 from "../../assets/Excel/NoviusLogo.png"; // Watermark logo

const TCPdf = async (tcData, projectName, setIsLoading) => {
  try {
    setIsLoading(true);
    if (!tcData || !tcData.tcForm) {
      throw new Error("No TC data available");
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
          url: "https://noviusrailtech.com/ ",
        });
      }

      // Main title - Novius Business System
      const mainTitle = "Novius Business System";
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      const mainTitleWidth = doc.getTextWidth(mainTitle);
      const mainTitleX = (pageWidth - mainTitleWidth) / 2;
      doc.text(mainTitle, mainTitleX, 15);

      // Subtitle - Test Certificate
      const subTitle = "Test Certificate";
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

    // Format label (camelCase to Title Case)
    const formatLabel = (str) => {
      return str
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase());
    };

    // Format date for display
    const formatDateDisplay = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // === SECTION 1: Test Certificate Details ===
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Test Certificate Details", 14, lastTableY);
    lastTableY += 15;

    const { tcForm } = tcData;

    const tcDetailsData = [
      ["Test Certificate Number", tcForm.TestCertificateNumber || "N/A"],
      ["Material Name", tcForm.MaterialName || "N/A"],
      ["Material Grade", tcForm.MaterialGrade || "N/A"],
      ["Test Date", formatDateDisplay(tcForm.TestDate)],
    ];

    // Calculate column widths
    const tableMargin = 10;
    const availableWidth = pageWidth - (tableMargin * 2);
    const fieldColumnWidth = availableWidth * 0.35;
    const valueColumnWidth = availableWidth * 0.65;

    autoTable(doc, {
      startY: lastTableY,
      margin: { left: tableMargin, right: tableMargin },
      tableWidth: availableWidth,
      head: [["Field", "Value"]],
      body: tcDetailsData,
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
        fillColor: [128, 128, 128],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: fieldColumnWidth, halign: "center" },
        1: { cellWidth: valueColumnWidth, halign: "center" },
      },
      didDrawPage: () => {
        addHeader();
        addWatermark();
      },
    });

    lastTableY = doc.lastAutoTable.finalY + 20;

    // === SECTION 2: TC Documents ===
    if (tcData.tcDocuments && tcData.tcDocuments.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("TC Documents", 14, lastTableY);
      lastTableY += 15;

      const tcDocumentsData = tcData.tcDocuments.map((doc, index) => [
        (index + 1).toString(),
        doc.docName || "N/A",
        doc.docReference || "N/A",
        doc.fileName ? extractFileName(doc.fileName) : "N/A",
      ]);

      autoTable(doc, {
        startY: lastTableY,
        margin: { left: tableMargin, right: tableMargin },
        tableWidth: availableWidth,
        head: [["S.No", "Document Name", "Document Reference", "File Name"]],
        body: tcDocumentsData,
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
          fillColor: [128, 128, 128],
          textColor: [255, 255, 255],
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

      lastTableY = doc.lastAutoTable.finalY + 20;
    }

    // === SECTION 3: TPI Documents ===
    if (tcData.tpiDocuments && tcData.tpiDocuments.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("TPI (Third Party Inspection) Documents", 14, lastTableY);
      lastTableY += 15;

      const tpiDocumentsData = tcData.tpiDocuments.map((doc, index) => [
        (index + 1).toString(),
        doc.docName || "N/A",
        doc.docReference || "N/A",
        doc.fileName ? extractFileName(doc.fileName) : "N/A",
      ]);

      autoTable(doc, {
        startY: lastTableY,
        margin: { left: tableMargin, right: tableMargin },
        tableWidth: availableWidth,
        head: [["S.No", "Document Name", "Document Reference", "File Name"]],
        body: tpiDocumentsData,
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
          fillColor: [128, 128, 128],
          textColor: [255, 255, 255],
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
    }

    addFooter();

    // Format filename
    const sanitizeFilename = (str) => {
      return str.replace(/[\\/:*?"<>|]/g, '_').trim();
    };

    const safeProjectName = sanitizeFilename(projectName || "Project");
    const filename = `${safeProjectName} - Test Certificate - ${formattedDateTime}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error("Error generating TC PDF:", error);
    alert(`Failed to generate TC PDF: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

// Helper function to extract filename after last "-"
const extractFileName = (filePathOrName) => {
  if (!filePathOrName) return "";
  const name = filePathOrName.split("/").pop();
  const lastDashIndex = name.lastIndexOf("-");
  if (lastDashIndex === -1) return name.trim();
  return name.substring(lastDashIndex + 1).trim();
};

export default TCPdf;