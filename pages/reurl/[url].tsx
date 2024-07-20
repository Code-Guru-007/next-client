import { GetServerSideProps } from "next";
import axios, { AxiosError } from "axios";
import { Locale, ServiceModuleValue } from "interfaces/utils";
import { AccessOrganizationModuleShare, ShareReurl } from "interfaces/entities";
import Reurl from "publicPages/Reurl";
import cheerio from "cheerio";

/**
 *
 * @info SSR returned props should be re-used in _app.ts root component of Next.js
 *
 */

const SSRSharedReurl = () => <Reurl />;

// This function runs on the server and pre-loads data for the page
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { params } = context;
  const baseUrl = process.env.BASE_URL;
  const apiUrl = `api/v1/share-reurl/${params?.url}?locale=${Locale.ZH_TW}`;

  const extractSharedDetails = (htmlString?: string) => {
    // Use cheerio to parse the HTML string on the server side
    const $ = cheerio.load(htmlString || "");

    // Extract the first <img> tag src string
    const imgSrc = $("img").first().attr("src") || null;
    const imgWidth = $("img").first().attr("width") || null;
    const imgHeight = $("img").first().attr("height") || null;
    const imgExt = imgSrc ? imgSrc.split(".").pop() : null;

    // Extract the first <h1> or <h2> tag text content
    const headingText = $("h1, h2").first().text();

    // Extract the first text content of a non-<h> tag
    const nonHeadingElements = $("p:not(h1):not(h2):not(img):not(span)");
    const nonHeadingTexts = nonHeadingElements
      .map((_, element) => $(element).text())
      .get()
      .filter((text) => text !== "");

    return {
      img: {
        src: imgSrc,
        ext: imgExt,
        width: imgWidth,
        height: imgHeight,
        ratio: Number(imgWidth || 380) / Number(imgHeight || 190),
      },
      headingText,
      nonHeadingText: nonHeadingTexts[0],
    };
  };

  // Fetch data from your API
  try {
    const response1 = await axios.get<ShareReurl>(`${baseUrl}/${apiUrl}`);

    let response2;

    // Article or Bulletin Share
    if (
      response1.data.organizationShareTargetType ===
        ServiceModuleValue.ARTICLE ||
      response1.data.organizationShareTargetType === ServiceModuleValue.BULLETIN
    ) {
      response2 = await axios.post<AccessOrganizationModuleShare>(
        `${baseUrl}/api/v1/organizations/${response1.data.organization?.organizationId}/shares/${response1.data.organizationShareId}`,
        {
          organizationSharePassword: "",
        }
      );
    }
    // CrmUser Share in filled-user-info
    if (
      response1.data.organizationShareTargetType === ServiceModuleValue.CRM_USER
    ) {
      response2 = response1;
    }

    // Returning the server-side props
    if (
      response1.data.organizationShareTargetType === ServiceModuleValue.ARTICLE
    ) {
      const { img, headingText, nonHeadingText } = extractSharedDetails(
        response2.data.articleContent
      );
      return {
        props: {
          img,
          title: `${response2.data.articleTitle}`,
          description: `${headingText || nonHeadingText}`,
        },
      };
    }
    if (
      response1.data.organizationShareTargetType === ServiceModuleValue.BULLETIN
    ) {
      const { img, headingText, nonHeadingText } = extractSharedDetails(
        response2.data.bulletinContent
      );
      return {
        props: {
          img,
          title: `${response2.data.bulletinTitle}`,
          description: `${headingText || nonHeadingText}`,
        },
      };
    }
    if (
      response1.data.organizationShareTargetType === ServiceModuleValue.CRM_USER
    ) {
      return {
        props: {
          img: {},
          title: `${response2.data.organizationUser.organizationUserNameZh}`,
          description: "InfoCenter 智能中台",
        },
      };
    }
  } catch (err) {
    const error = err as AxiosError;
    // Handle errors if your API calls fail
    if (error.message.includes("404")) {
      return {
        props: {
          img: {},
          title: "",
          description: `Data not Found.(Please Check the url ${params?.url} is correct)`,
        },
      };
    }
    if (error.message.includes("401")) {
      return {
        props: {
          img: {},
          title: "",
          description: `Data is protected to preview`,
        },
      };
    }
    return {
      props: {
        img: {},
        title: "",
        description: `${error.message}`,
      },
    };
  }

  // Return the fetched data as props for your page component
  return {
    props: {
      img: {},
      title: "",
      description: "",
    },
  };
};

export default SSRSharedReurl;
