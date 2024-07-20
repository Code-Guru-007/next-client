import React from "react";

// @mui
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import { useSettingsContext } from "minimal/components/settings";

import ChatNav from "./ChatNav";
import ChatRoom from "./ChatRoom";
import ChatMessageList from "./ChatMessageList";
import ChatHeaderDetail from "./ChatHeaderDetail";

const FeedbackDetail = function () {
  const settings = useSettingsContext();

  const participantsInConversation = [
    {
      id: "1",
      name: "Tiffany May",
      role: "test",
      email: "khalid_watsica@reed.ca",
      address: "address",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_1.jpg",
      phoneNumber: "(229)538-1421",
      lastActivity: "2023/10.21",
      status: "online",
    },
  ];

  const contacts = [
    {
      status: "busy",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b1",
      role: "HR Manager",
      email: "nannie_abernathy70@yahoo.com",
      name: "Jayvion Simon",
      lastActivity: "2023-10-20T17:39:39.530Z",
      address: "19034 Verna Unions Apt. 164 - Honolulu, RI / 87535",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_1.jpg",
      phoneNumber: "365-374-4961",
    },
    {
      status: "online",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2",
      role: "Data Analyst",
      email: "ashlynn_ohara62@gmail.com",
      name: "Lucian Obrien",
      lastActivity: "2023-10-19T16:39:39.530Z",
      address: "1147 Rohan Drive Suite 819 - Burlington, VT / 82021",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_2.jpg",
      phoneNumber: "904-966-2836",
    },
    {
      status: "offline",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b3",
      role: "Legal Counsel",
      email: "milo.farrell@hotmail.com",
      name: "Deja Brady",
      lastActivity: "2023-10-18T15:39:39.530Z",
      address: "18605 Thompson Circle Apt. 086 - Idaho Falls, WV / 50337",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_3.jpg",
      phoneNumber: "399-757-9909",
    },
    {
      status: "online",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b4",
      role: "UX/UI Designer",
      email: "violet.ratke86@yahoo.com",
      name: "Harrison Stein",
      lastActivity: "2023-10-17T14:39:39.530Z",
      address: "110 Lamar Station Apt. 730 - Hagerstown, OK / 49808",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_4.jpg",
      phoneNumber: "692-767-2903",
    },
    {
      status: "offline",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b5",
      role: "Project Manager",
      email: "letha_lubowitz24@yahoo.com",
      name: "Reece Chung",
      lastActivity: "2023-10-16T13:39:39.530Z",
      address: "36901 Elmer Spurs Apt. 762 - Miramar, DE / 92836",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_5.jpg",
      phoneNumber: "990-588-5716",
    },
    {
      status: "online",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b6",
      role: "Account Manager",
      email: "aditya_greenfelder31@gmail.com",
      name: "Lainey Davidson",
      lastActivity: "2023-10-15T12:39:39.530Z",
      address: "2089 Runolfsson Harbors Suite 886 - Chapel Hill, TX / 32827",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_6.jpg",
      phoneNumber: "955-439-2578",
    },
    {
      status: "alway",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b7",
      role: "Registered Nurse",
      email: "lenna_bergnaum27@hotmail.com",
      name: "Cristopher Cardenas",
      lastActivity: "2023-10-14T11:39:39.530Z",
      address: "279 Karolann Ports Apt. 774 - Prescott Valley, WV / 53905",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_7.jpg",
      phoneNumber: "226-924-4058",
    },
    {
      status: "online",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b8",
      role: "Business Analyst",
      email: "luella.ryan33@gmail.com",
      name: "Melanie Noble",
      lastActivity: "2023-10-13T10:39:39.530Z",
      address: "96607 Claire Square Suite 591 - St. Louis Park, HI / 40802",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_8.jpg",
      phoneNumber: "552-917-1454",
    },
    {
      status: "offline",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b9",
      role: "Creative Director",
      email: "joana.simonis84@gmail.com",
      name: "Chase Day",
      lastActivity: "2023-10-12T09:39:39.530Z",
      address: "9388 Auer Station Suite 573 - Honolulu, AK / 98024",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_9.jpg",
      phoneNumber: "285-840-9338",
    },
    {
      status: "online",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b10",
      role: "Financial Planner",
      email: "marjolaine_white94@gmail.com",
      name: "Shawn Manning",
      lastActivity: "2023-10-11T08:39:39.530Z",
      address: "47665 Adaline Squares Suite 510 - Blacksburg, NE / 53515",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_10.jpg",
      phoneNumber: "306-269-2446",
    },
    {
      status: "offline",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b11",
      role: "Event Coordinator",
      email: "vergie_block82@hotmail.com",
      name: "Soren Durham",
      lastActivity: "2023-10-10T07:39:39.530Z",
      address: "989 Vernice Flats Apt. 183 - Billings, NV / 04147",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_11.jpg",
      phoneNumber: "883-373-6253",
    },
    {
      status: "online",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b12",
      role: "Marketing Director",
      email: "vito.hudson@hotmail.com",
      name: "Cortez Herring",
      lastActivity: "2023-10-09T06:39:39.530Z",
      address: "91020 Wehner Locks Apt. 673 - Albany, WY / 68763",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_12.jpg",
      phoneNumber: "476-509-8866",
    },
    {
      status: "busy",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b13",
      role: "Software Developer",
      email: "tyrel_greenholt@gmail.com",
      name: "Brycen Jimenez",
      lastActivity: "2023-10-08T05:39:39.530Z",
      address: "585 Candelario Pass Suite 090 - Columbus, LA / 25376",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_13.jpg",
      phoneNumber: "201-465-1954",
    },
    {
      status: "online",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b14",
      role: "Research Scientist",
      email: "dwight.block85@yahoo.com",
      name: "Giana Brandt",
      lastActivity: "2023-10-07T04:39:39.530Z",
      address: "80988 Renner Crest Apt. 000 - Fargo, VA / 24266",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_14.jpg",
      phoneNumber: "538-295-9408",
    },
    {
      status: "offline",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b15",
      role: "Content Strategist",
      email: "mireya13@hotmail.com",
      name: "Aspen Schmitt",
      lastActivity: "2023-10-06T03:39:39.530Z",
      address: "28307 Shayne Pike Suite 523 - North Las Vegas, AZ / 28550",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_15.jpg",
      phoneNumber: "531-492-6028",
    },
    {
      status: "online",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b16",
      role: "Operations Manager",
      email: "dasia_jenkins@hotmail.com",
      name: "Colten Aguilar",
      lastActivity: "2023-10-05T02:39:39.530Z",
      address: "205 Farrell Highway Suite 333 - Rock Hill, OK / 63421",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_16.jpg",
      phoneNumber: "981-699-7588",
    },
    {
      status: "offline",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b17",
      role: "Sales Representative",
      email: "benny89@yahoo.com",
      name: "Angelique Morse",
      lastActivity: "2023-10-04T01:39:39.530Z",
      address: "253 Kara Motorway Suite 821 - Manchester, SD / 09331",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_17.jpg",
      phoneNumber: "500-268-4826",
    },
    {
      status: "online",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b18",
      role: "Supply Chain Analyst",
      email: "dawn.goyette@gmail.com",
      name: "Selina Boyer",
      lastActivity: "2023-10-03T00:39:39.530Z",
      address: "13663 Kiara Oval Suite 606 - Missoula, AR / 44478",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_18.jpg",
      phoneNumber: "205-952-3828",
    },
    {
      status: "alway",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b19",
      role: "Operations Coordinator",
      email: "zella_hickle4@yahoo.com",
      name: "Lawson Bass",
      lastActivity: "2023-10-01T23:39:39.530Z",
      address: "8110 Claire Port Apt. 703 - Anchorage, TN / 01753",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_19.jpg",
      phoneNumber: "222-255-5190",
    },
    {
      status: "online",
      id: "e99f09a7-dd88-49d5-b1c8-1daf80c2d7b20",
      role: "Customer Service Associate",
      email: "avery43@hotmail.com",
      name: "Ariana Lang",
      lastActivity: "2023-09-30T22:39:39.530Z",
      address: "4642 Demetris Lane Suite 407 - Edmond, AZ / 60888",
      avatarUrl:
        "https://api-prod-minimal-v510.vercel.app/assets/images/avatar/avatar_20.jpg",
      phoneNumber: "408-439-8033",
    },
  ];

  const conversations = {
    byId: "test",
    allIds: [
      "1",
      "2",
      "3",
      "3",
      "3",
      "3",
      "3",
      "3",
      "3",
      "3",
      "3",
      "3",
      "3",
      "3",
      "3",
      "3",
    ],
  };

  const messages = [
    {
      id: "1",
      body: "Hey John, I am looking for the best admin template. Could you please help me to find it out? 🤔",
      createdAt: new Date(),
      senderId: "1",
      contentType: "text",
      attachments: [],
    },
    {
      id: "1",
      body: "Looks clean and fresh UI. 😃",
      createdAt: new Date(),
      senderId: "1",
      contentType: "text",
      attachments: [],
    },
    {
      id: "1",
      body: "https://api-prod-minimal-v510.vercel.app/assets/images/cover/cover_5.jpg",
      createdAt: new Date(),
      senderId: "1",
      contentType: "image",
      attachments: [],
    },
  ];
  const renderHead = (
    <Stack
      direction="row"
      alignItems="center"
      flexShrink={0}
      sx={{ pr: 1, pl: 2.5, py: 1, minHeight: 72 }}
    >
      <ChatHeaderDetail participants={participantsInConversation} />
    </Stack>
  );

  const renderNav = (
    <ChatNav
      contacts={contacts}
      conversations={conversations}
      loading={false}
      currentConversationId={null}
    />
  );

  const renderMessages = (
    <Stack
      sx={{
        width: 1,
        height: 1,
        overflow: "hidden",
      }}
    >
      <ChatMessageList
        messages={messages || []}
        participants={participantsInConversation || []}
      />
    </Stack>
  );

  return (
    <Container maxWidth={settings.themeStretch ? false : "xl"}>
      <Stack component={Card} direction="row" sx={{ height: "72vh" }}>
        {renderNav}

        <Stack
          sx={{
            width: 1,
            height: 1,
            overflow: "hidden",
          }}
        >
          {renderHead}

          <Stack
            direction="row"
            sx={{
              width: 1,
              height: 1,
              overflow: "hidden",
              borderTop: (theme) => `solid 1px ${theme.palette.divider}`,
            }}
          >
            {renderMessages}

            <ChatRoom
              conversation={{
                id: "",
                messages: [],
                type: "",
                unreadCount: 0,
                participants: [],
              }}
              participants={participantsInConversation || []}
            />
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
};

export default FeedbackDetail;
