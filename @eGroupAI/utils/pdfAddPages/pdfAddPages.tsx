import { jsPDF as JsPDF } from "jspdf";
import html2canvas from "html2canvas";

const getImageHeight = (
  pageWidth: number,
  contentWidth: number,
  contentHeight: number
) => (pageWidth / contentWidth) * contentHeight;

const addImage = async (
  pdf: JsPDF,
  pageWidth: number,
  pageHeight: number,
  el: HTMLDivElement,
  options: PdfAppendImagesOptions = {}
) => {
  const { xPadding = 0, yPadding = 0 } = options;
  const canvas = await html2canvas(el);
  const imgWidth = pageWidth - 2 * xPadding;
  const imgHeight = getImageHeight(imgWidth, canvas.width, canvas.height);
  const image = canvas.toDataURL("image/jpeg", 1.0);
  // add first image
  pdf.addImage(image, "JPEG", xPadding, yPadding, imgWidth, imgHeight);
  // calculate if this image is more height than pageHeight
  let heightLeft = imgHeight;
  let position = yPadding;
  heightLeft -= pageHeight;
  while (heightLeft >= 0) {
    position += heightLeft - imgHeight; // top padding for other pages
    pdf.addPage();
    pdf.addImage(image, "JPEG", xPadding, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  // remove node
  el.remove();
};

const wrapGroup = (containerId: string, group: HTMLDivElement[]) => {
  const wrapper = document.createElement("div");
  group.forEach((el) => {
    wrapper.appendChild(el.cloneNode(true));
  });
  const container = document.getElementById(containerId);
  if (container) {
    container.append(wrapper);
  }
  return wrapper;
};

export type PdfAppendImagesOptions = {
  xPadding?: number;
  yPadding?: number;
};

/**
 * jspdf add A4 pages for download or print.
 * @param containerId
 * @param pdf
 * @param items
 * @param options
 */
const pdfAddPages = async (
  containerId: string,
  pdf: JsPDF,
  items: HTMLDivElement[],
  options: PdfAppendImagesOptions = {}
) => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  // Create page group by items and total items height should fit in page height.
  const pageGroups: HTMLDivElement[] = [];
  let group: HTMLDivElement[] = [];
  let leftHeight = pageHeight;
  for (let i = 0; i < items.length; i += 1) {
    const el = items[i];
    const imgHeight = getImageHeight(
      pageWidth,
      el?.offsetWidth as number,
      el?.offsetHeight as number
    );

    if (imgHeight > pageHeight) {
      pageGroups.push(wrapGroup(containerId, [el as HTMLDivElement]));
      break;
    }
    if (leftHeight > imgHeight) {
      group.push(el as HTMLDivElement);
      leftHeight -= imgHeight;
    } else {
      i -= 1;
      pageGroups.push(wrapGroup(containerId, group));
      group = [];
      leftHeight = pageHeight;
    }
  }
  // add last group
  if (group.length > 0) {
    pageGroups.push(wrapGroup(containerId, group));
  }

  const results = pageGroups.map((page, index) => {
    const group = page;
    if (index !== 0 && index + 1 < pageGroups.length) {
      pdf.addPage();
    }
    return addImage(
      pdf,
      pageWidth,
      pageHeight,
      group as HTMLDivElement,
      options
    );
  });

  await Promise.all(results);
};

export default pdfAddPages;
