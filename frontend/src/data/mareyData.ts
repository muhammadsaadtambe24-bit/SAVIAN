// frontend/src/data/mareyData.ts
import { Station, TrainSchedule, MaintenanceBlock } from '@/types/marey';

export const CORRIDOR_STATIONS: Station[] = [
  { id: 1, code: 'BINA', name: 'Bina Junction', distance_km: 0.0, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 2, code: 'KIKA', name: 'Kurwai Kethora', distance_km: 8.4, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 3, code: 'MABA', name: 'Mandi Bamora', distance_km: 17.2, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 4, code: 'KLH', name: 'Kulhar', distance_km: 26.0, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 5, code: 'BET', name: 'Bareth', distance_km: 35.8, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 6, code: 'BAQ', name: 'Ganj Basoda', distance_km: 45.6, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 7, code: 'PBI', name: 'Pabai', distance_km: 54.5, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 8, code: 'GLG', name: 'Gulabganj', distance_km: 62.4, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 9, code: 'SUMR', name: 'Sumer', distance_km: 70.3, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 10, code: 'SORI', name: 'Sorai', distance_km: 78.8, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 11, code: 'BHS', name: 'Vidisha', distance_km: 85.0, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 12, code: 'DWG', name: 'Dewanganj', distance_km: 94.2, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 13, code: 'SMT', name: 'Salamatpur', distance_km: 100.8, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 14, code: 'SCI', name: 'Sanchi', distance_km: 108.5, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 15, code: 'SUW', name: 'Sukhi Sewaniyan', distance_km: 123.6, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 16, code: 'NSZ', name: 'Nishatpura Jn', distance_km: 134.2, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 17, code: 'BPL', name: 'Bhopal Junction', distance_km: 139.0, division: 'BPL', zone: 'WCR', kavach_status: 'COMMISSIONED' },
  { id: 18, code: 'RKMP', name: 'Rani Kamlapati', distance_km: 145.4, division: 'BPL', zone: 'WCR', kavach_status: 'COMMISSIONED' },
  { id: 19, code: 'MSO', name: 'Misrod', distance_km: 151.7, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 20, code: 'MDDP', name: 'Mandideep', distance_km: 158.5, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 21, code: 'ODG', name: 'Obaidulla Ganj', distance_km: 171.8, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 22, code: 'BKA', name: 'Barkhera', distance_km: 181.2, division: 'BPL', zone: 'WCR', kavach_status: 'IN_TRIALS' },
  { id: 23, code: 'MDG', name: 'Midghat', distance_km: 189.5, division: 'BPL', zone: 'WCR', kavach_status: 'IN_TRIALS' },
  { id: 24, code: 'CHC', name: 'Chokardi', distance_km: 196.2, division: 'BPL', zone: 'WCR', kavach_status: 'IN_TRIALS' },
  { id: 25, code: 'BNI', name: 'Budni', distance_km: 205.8, division: 'BPL', zone: 'WCR', kavach_status: 'IN_TRIALS' },
  { id: 26, code: 'NDPM', name: 'Narmadapuram', distance_km: 213.6, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
  { id: 27, code: 'ET', name: 'Itarsi Junction', distance_km: 231.5, division: 'BPL', zone: 'WCR', kavach_status: 'NOT_EQUIPPED' },
];

export const MOCK_TRAIN_SCHEDULES: TrainSchedule[] = [
  // 1. RAJDHANI - 12433 Rajdhani Express (DOWN: BINA -> ET)
  {
    train_number: '12433',
    train_name: 'Hazrat Nizamuddin - Chennai Rajdhani',
    train_type: 'RAJDHANI',
    direction: 'DOWN',
    path: [
      { station_code: 'BINA', arrival_minutes: 90, departure_minutes: 95 },
      { station_code: 'BAQ', arrival_minutes: 122, departure_minutes: 122 },
      { station_code: 'BHS', arrival_minutes: 148, departure_minutes: 148 },
      { station_code: 'BPL', arrival_minutes: 185, departure_minutes: 195 }, // 10 min dwell
      { station_code: 'RKMP', arrival_minutes: 204, departure_minutes: 204 },
      { station_code: 'BKA', arrival_minutes: 228, departure_minutes: 228 },
      { station_code: 'BNI', arrival_minutes: 246, departure_minutes: 246 },
      { station_code: 'ET', arrival_minutes: 270, departure_minutes: 280 },
    ],
  },
  // 2. RAJDHANI - 12434 Rajdhani Express (UP: ET -> BINA)
  {
    train_number: '12434',
    train_name: 'Chennai - Hazrat Nizamuddin Rajdhani',
    train_type: 'RAJDHANI',
    direction: 'UP',
    path: [
      { station_code: 'ET', arrival_minutes: 840, departure_minutes: 845 },
      { station_code: 'BNI', arrival_minutes: 868, departure_minutes: 868 },
      { station_code: 'BKA', arrival_minutes: 887, departure_minutes: 887 },
      { station_code: 'RKMP', arrival_minutes: 912, departure_minutes: 912 },
      { station_code: 'BPL', arrival_minutes: 920, departure_minutes: 930 }, // 10 min dwell
      { station_code: 'BHS', arrival_minutes: 968, departure_minutes: 968 },
      { station_code: 'BAQ', arrival_minutes: 994, departure_minutes: 994 },
      { station_code: 'BINA', arrival_minutes: 1025, departure_minutes: 1030 },
    ],
  },
  // 3. VANDE_BHARAT - 20172 Vande Bharat Express (DOWN: BINA -> ET)
  {
    train_number: '20172',
    train_name: 'Hazrat Nizamuddin - Rani Kamlapati Vande Bharat',
    train_type: 'VANDE_BHARAT',
    direction: 'DOWN',
    path: [
      { station_code: 'BINA', arrival_minutes: 360, departure_minutes: 362 },
      { station_code: 'BAQ', arrival_minutes: 388, departure_minutes: 388 },
      { station_code: 'BHS', arrival_minutes: 412, departure_minutes: 414 }, // 2 min dwell
      { station_code: 'BPL', arrival_minutes: 450, departure_minutes: 455 }, // 5 min dwell
      { station_code: 'RKMP', arrival_minutes: 465, departure_minutes: 475 },
      { station_code: 'NDPM', arrival_minutes: 520, departure_minutes: 522 },
      { station_code: 'ET', arrival_minutes: 545, departure_minutes: 550 },
    ],
  },
  // 4. VANDE_BHARAT - 20171 Vande Bharat Express (UP: ET -> BINA)
  {
    train_number: '20171',
    train_name: 'Rani Kamlapati - Hazrat Nizamuddin Vande Bharat',
    train_type: 'VANDE_BHARAT',
    direction: 'UP',
    path: [
      { station_code: 'ET', arrival_minutes: 1140, departure_minutes: 1145 },
      { station_code: 'NDPM', arrival_minutes: 1163, departure_minutes: 1165 },
      { station_code: 'RKMP', arrival_minutes: 1215, departure_minutes: 1225 }, // 10 min dwell
      { station_code: 'BPL', arrival_minutes: 1235, departure_minutes: 1240 }, // 5 min dwell
      { station_code: 'BHS', arrival_minutes: 1275, departure_minutes: 1277 },
      { station_code: 'BAQ', arrival_minutes: 1300, departure_minutes: 1300 },
      { station_code: 'BINA', arrival_minutes: 1330, departure_minutes: 1335 },
    ],
  },
  // 5. EXPRESS - 12002 Shatabdi Express (DOWN: BINA -> ET)
  {
    train_number: '12002',
    train_name: 'New Delhi - Bhopal Shatabdi Express',
    train_type: 'EXPRESS',
    direction: 'DOWN',
    path: [
      { station_code: 'BINA', arrival_minutes: 135, departure_minutes: 138 },
      { station_code: 'MABA', arrival_minutes: 150, departure_minutes: 150 },
      { station_code: 'BAQ', arrival_minutes: 172, departure_minutes: 174 },
      { station_code: 'BHS', arrival_minutes: 202, departure_minutes: 204 },
      { station_code: 'BPL', arrival_minutes: 245, departure_minutes: 255 }, // 10 min dwell
      { station_code: 'RKMP', arrival_minutes: 268, departure_minutes: 270 },
      { station_code: 'MDDP', arrival_minutes: 284, departure_minutes: 284 },
      { station_code: 'NDPM', arrival_minutes: 326, departure_minutes: 328 },
      { station_code: 'ET', arrival_minutes: 350, departure_minutes: 360 },
    ],
  },
  // 6. EXPRESS - 12155 Shan-e-Bhopal Express (UP: ET -> BINA)
  {
    train_number: '12155',
    train_name: 'Shan-e-Bhopal Superfast Express',
    train_type: 'EXPRESS',
    direction: 'UP',
    path: [
      { station_code: 'ET', arrival_minutes: 1280, departure_minutes: 1285 },
      { station_code: 'NDPM', arrival_minutes: 1305, departure_minutes: 1307 },
      { station_code: 'RKMP', arrival_minutes: 1358, departure_minutes: 1362 },
      { station_code: 'BPL', arrival_minutes: 1375, departure_minutes: 1385 },
      { station_code: 'BHS', arrival_minutes: 1425, departure_minutes: 1427 },
      { station_code: 'BINA', arrival_minutes: 1475, departure_minutes: 1480 },
    ],
  },
  // 7. MAIL - 12616 Grand Trunk Express (DOWN: BINA -> ET)
  {
    train_number: '12616',
    train_name: 'Grand Trunk (GT) Express',
    train_type: 'MAIL',
    direction: 'DOWN',
    path: [
      { station_code: 'BINA', arrival_minutes: 480, departure_minutes: 485 },
      { station_code: 'BAQ', arrival_minutes: 522, departure_minutes: 525 },
      { station_code: 'GLG', arrival_minutes: 543, departure_minutes: 543 },
      { station_code: 'BHS', arrival_minutes: 566, departure_minutes: 570 },
      { station_code: 'SCI', arrival_minutes: 593, departure_minutes: 595 },
      { station_code: 'BPL', arrival_minutes: 630, departure_minutes: 640 }, // 10 min dwell
      { station_code: 'RKMP', arrival_minutes: 652, departure_minutes: 655 },
      { station_code: 'MDDP', arrival_minutes: 673, departure_minutes: 675 },
      { station_code: 'ODG', arrival_minutes: 694, departure_minutes: 694 },
      { station_code: 'BKA', arrival_minutes: 710, departure_minutes: 710 },
      { station_code: 'BNI', arrival_minutes: 738, departure_minutes: 740 },
      { station_code: 'NDPM', arrival_minutes: 755, departure_minutes: 758 },
      { station_code: 'ET', arrival_minutes: 785, departure_minutes: 795 },
    ],
  },
  // 8. MAIL - 12622 Tamil Nadu Express (UP: ET -> BINA)
  {
    train_number: '12622',
    train_name: 'Tamil Nadu Express',
    train_type: 'MAIL',
    direction: 'UP',
    path: [
      { station_code: 'ET', arrival_minutes: 400, departure_minutes: 410 },
      { station_code: 'NDPM', arrival_minutes: 435, departure_minutes: 438 },
      { station_code: 'BNI', arrival_minutes: 454, departure_minutes: 454 },
      { station_code: 'BKA', arrival_minutes: 480, departure_minutes: 480 },
      { station_code: 'MDDP', arrival_minutes: 512, departure_minutes: 514 },
      { station_code: 'RKMP', arrival_minutes: 532, departure_minutes: 535 },
      { station_code: 'BPL', arrival_minutes: 546, departure_minutes: 556 }, // 10 min dwell
      { station_code: 'BHS', arrival_minutes: 610, departure_minutes: 614 },
      { station_code: 'BAQ', arrival_minutes: 650, departure_minutes: 653 },
      { station_code: 'BINA', arrival_minutes: 700, departure_minutes: 710 },
    ],
  },
  // 9. PASSENGER - 01820 Bina-Itarsi MEMU Special (DOWN: all stations)
  {
    train_number: '01820',
    train_name: 'Bina - Itarsi MEMU Special',
    train_type: 'PASSENGER',
    direction: 'DOWN',
    path: [
      { station_code: 'BINA', arrival_minutes: 660, departure_minutes: 662 },
      { station_code: 'KIKA', arrival_minutes: 672, departure_minutes: 674 },
      { station_code: 'MABA', arrival_minutes: 685, departure_minutes: 687 },
      { station_code: 'KLH', arrival_minutes: 698, departure_minutes: 700 },
      { station_code: 'BET', arrival_minutes: 712, departure_minutes: 714 },
      { station_code: 'BAQ', arrival_minutes: 726, departure_minutes: 728 },
      { station_code: 'PBI', arrival_minutes: 739, departure_minutes: 741 },
      { station_code: 'GLG', arrival_minutes: 751, departure_minutes: 753 },
      { station_code: 'SUMR', arrival_minutes: 763, departure_minutes: 765 },
      { station_code: 'SORI', arrival_minutes: 776, departure_minutes: 778 },
      { station_code: 'BHS', arrival_minutes: 786, departure_minutes: 788 },
      { station_code: 'DWG', arrival_minutes: 800, departure_minutes: 802 },
      { station_code: 'SMT', arrival_minutes: 810, departure_minutes: 812 },
      { station_code: 'SCI', arrival_minutes: 822, departure_minutes: 824 },
      { station_code: 'SUW', arrival_minutes: 843, departure_minutes: 845 },
      { station_code: 'NSZ', arrival_minutes: 858, departure_minutes: 860 },
      { station_code: 'BPL', arrival_minutes: 866, departure_minutes: 872 },
      { station_code: 'RKMP', arrival_minutes: 880, departure_minutes: 884 },
      { station_code: 'MSO', arrival_minutes: 894, departure_minutes: 896 },
      { station_code: 'MDDP', arrival_minutes: 906, departure_minutes: 908 },
      { station_code: 'ODG', arrival_minutes: 924, departure_minutes: 926 },
      { station_code: 'BKA', arrival_minutes: 938, departure_minutes: 940 },
      { station_code: 'MDG', arrival_minutes: 950, departure_minutes: 952 },
      { station_code: 'CHC', arrival_minutes: 960, departure_minutes: 962 },
      { station_code: 'BNI', arrival_minutes: 974, departure_minutes: 976 },
      { station_code: 'NDPM', arrival_minutes: 986, departure_minutes: 988 },
      { station_code: 'ET', arrival_minutes: 1010, departure_minutes: 1015 },
    ],
  },
  // 10. PASSENGER - 01819 Itarsi-Bina MEMU Special (UP: all stations)
  {
    train_number: '01819',
    train_name: 'Itarsi - Bina MEMU Special',
    train_type: 'PASSENGER',
    direction: 'UP',
    path: [
      { station_code: 'ET', arrival_minutes: 360, departure_minutes: 362 },
      { station_code: 'NDPM', arrival_minutes: 382, departure_minutes: 384 },
      { station_code: 'BNI', arrival_minutes: 395, departure_minutes: 397 },
      { station_code: 'CHC', arrival_minutes: 408, departure_minutes: 410 },
      { station_code: 'MDG', arrival_minutes: 418, departure_minutes: 420 },
      { station_code: 'BKA', arrival_minutes: 430, departure_minutes: 432 },
      { station_code: 'ODG', arrival_minutes: 444, departure_minutes: 446 },
      { station_code: 'MDDP', arrival_minutes: 462, departure_minutes: 464 },
      { station_code: 'MSO', arrival_minutes: 472, departure_minutes: 474 },
      { station_code: 'RKMP', arrival_minutes: 482, departure_minutes: 486 },
      { station_code: 'BPL', arrival_minutes: 494, departure_minutes: 500 },
      { station_code: 'NSZ', arrival_minutes: 506, departure_minutes: 508 },
      { station_code: 'SUW', arrival_minutes: 521, departure_minutes: 523 },
      { station_code: 'SCI', arrival_minutes: 542, departure_minutes: 544 },
      { station_code: 'SMT', arrival_minutes: 554, departure_minutes: 556 },
      { station_code: 'DWG', arrival_minutes: 564, departure_minutes: 566 },
      { station_code: 'BHS', arrival_minutes: 578, departure_minutes: 580 },
      { station_code: 'SORI', arrival_minutes: 588, departure_minutes: 590 },
      { station_code: 'SUMR', arrival_minutes: 601, departure_minutes: 603 },
      { station_code: 'GLG', arrival_minutes: 613, departure_minutes: 615 },
      { station_code: 'PBI', arrival_minutes: 625, departure_minutes: 627 },
      { station_code: 'BAQ', arrival_minutes: 638, departure_minutes: 640 },
      { station_code: 'BET', arrival_minutes: 652, departure_minutes: 654 },
      { station_code: 'KLH', arrival_minutes: 666, departure_minutes: 668 },
      { station_code: 'MABA', arrival_minutes: 679, departure_minutes: 681 },
      { station_code: 'KIKA', arrival_minutes: 692, departure_minutes: 694 },
      { station_code: 'BINA', arrival_minutes: 704, departure_minutes: 710 },
    ],
  },
  // 11. FREIGHT - BOXN-8821 Thermal Coal Rake (UP: ET -> BINA)
  {
    train_number: 'BOXN-8821',
    train_name: 'Thermal Coal Freight Rake',
    train_type: 'FREIGHT',
    direction: 'UP',
    path: [
      { station_code: 'ET', arrival_minutes: 720, departure_minutes: 725 },
      { station_code: 'NDPM', arrival_minutes: 746, departure_minutes: 746 },
      { station_code: 'BNI', arrival_minutes: 755, departure_minutes: 755 },
      { station_code: 'CHC', arrival_minutes: 766, departure_minutes: 766 },
      { station_code: 'MDG', arrival_minutes: 774, departure_minutes: 774 },
      { station_code: 'BKA', arrival_minutes: 784, departure_minutes: 799 }, // 15 min loop wait
      { station_code: 'ODG', arrival_minutes: 810, departure_minutes: 810 },
      { station_code: 'MDDP', arrival_minutes: 825, departure_minutes: 825 },
      { station_code: 'MSO', arrival_minutes: 833, departure_minutes: 833 },
      { station_code: 'RKMP', arrival_minutes: 840, departure_minutes: 840 },
      { station_code: 'BPL', arrival_minutes: 847, departure_minutes: 857 },
      { station_code: 'NSZ', arrival_minutes: 863, departure_minutes: 863 },
      { station_code: 'SUW', arrival_minutes: 875, departure_minutes: 875 },
      { station_code: 'SCI', arrival_minutes: 892, departure_minutes: 892 },
      { station_code: 'SMT', arrival_minutes: 901, departure_minutes: 901 },
      { station_code: 'DWG', arrival_minutes: 909, departure_minutes: 909 },
      { station_code: 'BHS', arrival_minutes: 920, departure_minutes: 930 },
      { station_code: 'SORI', arrival_minutes: 937, departure_minutes: 937 },
      { station_code: 'SUMR', arrival_minutes: 947, departure_minutes: 947 },
      { station_code: 'GLG', arrival_minutes: 956, departure_minutes: 956 },
      { station_code: 'PBI', arrival_minutes: 965, departure_minutes: 965 },
      { station_code: 'BAQ', arrival_minutes: 975, departure_minutes: 975 },
      { station_code: 'BET', arrival_minutes: 986, departure_minutes: 986 },
      { station_code: 'KLH', arrival_minutes: 997, departure_minutes: 997 },
      { station_code: 'MABA', arrival_minutes: 1007, departure_minutes: 1007 },
      { station_code: 'KIKA', arrival_minutes: 1017, departure_minutes: 1017 },
      { station_code: 'BINA', arrival_minutes: 1027, departure_minutes: 1032 },
    ],
  },
  // 12. FREIGHT - BCN-4412 Container Rake (DOWN: BINA -> ET)
  {
    train_number: 'BCN-4412',
    train_name: 'CONCOR Container Rake',
    train_type: 'FREIGHT',
    direction: 'DOWN',
    path: [
      { station_code: 'BINA', arrival_minutes: 1040, departure_minutes: 1050 },
      { station_code: 'BAQ', arrival_minutes: 1105, departure_minutes: 1115 },
      { station_code: 'BHS', arrival_minutes: 1150, departure_minutes: 1150 },
      { station_code: 'BPL', arrival_minutes: 1210, departure_minutes: 1220 },
      { station_code: 'RKMP', arrival_minutes: 1230, departure_minutes: 1230 },
      { station_code: 'MDDP', arrival_minutes: 1250, departure_minutes: 1250 },
      { station_code: 'BKA', arrival_minutes: 1280, departure_minutes: 1300 }, // 20 min brake inspection
      { station_code: 'BNI', arrival_minutes: 1330, departure_minutes: 1330 },
      { station_code: 'NDPM', arrival_minutes: 1350, departure_minutes: 1350 },
      { station_code: 'ET', arrival_minutes: 1380, departure_minutes: 1390 },
    ],
  },
];

export const MOCK_MAINTENANCE_BLOCKS: MaintenanceBlock[] = [
  // 1. P_WAY Normal Block - BCM Deep Screening at BINA - KIKA
  {
    block_id: 'BLK-PWAY-101',
    demand_code: 'TMS-2026-089',
    department: 'P_WAY',
    start_km: 2.5,
    end_km: 7.2,
    start_minutes: 120, // 02:00
    end_minutes: 270,   // 04:30
    status: 'GRANTED',
    is_shadow: false,
    has_clash: false,
    section_from: 'BINA',
    section_to: 'KIKA',
    activity_description: 'BCM Ballast Cleaning Machine deep screening track maintenance',
    machinery_type: 'BCM-Plasser-09',
  },
  // 2. OHE Shadow Block - Tower Wagon co-aligned under BLK-PWAY-101
  {
    block_id: 'BLK-OHE-102',
    demand_code: 'SMMS-2026-114',
    department: 'OHE',
    start_km: 2.0,
    end_km: 7.0,
    start_minutes: 130, // 02:10
    end_minutes: 250,   // 04:10
    status: 'SHADOW',
    is_shadow: true,
    has_clash: false,
    shadow_parent_id: 'BLK-PWAY-101',
    section_from: 'BINA',
    section_to: 'KIKA',
    activity_description: 'Contact wire height checking & cantilever replacement (Shadow Co-utilization)',
    machinery_type: 'Tower Wagon TW-44',
  },
  // 3. S_AND_T Normal Block - Point Machine Overhaul at BAQ - GLG
  {
    block_id: 'BLK-SNT-103',
    demand_code: 'TDMS-2026-042',
    department: 'S_AND_T',
    start_km: 46.0,
    end_km: 58.0,
    start_minutes: 300, // 05:00
    end_minutes: 420,   // 07:00
    status: 'PROPOSED',
    is_shadow: false,
    has_clash: false,
    section_from: 'BAQ',
    section_to: 'GLG',
    activity_description: 'Electronic Interlocking dual-VDU point machine overhaul',
    machinery_type: 'Signal Testing Rig ST-12',
  },
  // 4. P_WAY Normal Block - Continuous Tamping at BPL - RKMP
  {
    block_id: 'BLK-PWAY-104',
    demand_code: 'TMS-2026-095',
    department: 'P_WAY',
    start_km: 139.5,
    end_km: 145.0,
    start_minutes: 60,  // 01:00
    end_minutes: 240,  // 04:00
    status: 'GRANTED',
    is_shadow: false,
    has_clash: false,
    section_from: 'BPL',
    section_to: 'RKMP',
    activity_description: 'CSM Duomatic continuous track tamping & lining',
    machinery_type: 'CSM Tamper CSM-77',
  },
  // 5. OHE Normal Block - Dropper adjustment at BKA - ODG
  {
    block_id: 'BLK-OHE-105',
    demand_code: 'SMMS-2026-121',
    department: 'OHE',
    start_km: 172.0,
    end_km: 180.5,
    start_minutes: 660, // 11:00
    end_minutes: 780,  // 13:00
    status: 'GRANTED',
    is_shadow: false,
    has_clash: false,
    section_from: 'ODG',
    section_to: 'BKA',
    activity_description: 'Mid-span neutral section dropper adjustment and isolator testing',
    machinery_type: '8-Wheeler Tower Wagon TW-801',
  },
  // 6. CLASH DEMO BLOCK 1 (P_WAY) - Clashing with 01820 MEMU and freight rake
  // In chaos mode, this has_clash=true will show the pulsing glowing red border!
  {
    block_id: 'BLK-CLASH-106',
    demand_code: 'TMS-2026-CHAOS-1',
    department: 'P_WAY',
    start_km: 84.0,
    end_km: 96.0,
    start_minutes: 770, // 12:50
    end_minutes: 920,   // 15:20
    status: 'PROPOSED',
    is_shadow: false,
    has_clash: true, // CLASH WITH 01820 MEMU (passes BHS at 786-788)
    section_from: 'BHS',
    section_to: 'DWG',
    activity_description: 'Emergency rail weld replacement & ultrasonic flaw detection (Conflicting with Passenger slot)',
    machinery_type: 'Flash Butt Welder FBW-12',
  },
  // 7. CLASH DEMO BLOCK 2 (OHE) - Ghat section power block clash with UP Rajdhani 12434
  {
    block_id: 'BLK-CLASH-107',
    demand_code: 'SMMS-2026-CHAOS-2',
    department: 'OHE',
    start_km: 182.0,
    end_km: 204.0,
    start_minutes: 850, // 14:10
    end_minutes: 960,   // 16:00
    status: 'PROPOSED',
    is_shadow: false,
    has_clash: true, // CLASH WITH 12434 Rajdhani (passes BKA at 887)
    section_from: 'BKA',
    section_to: 'BNI',
    activity_description: 'Ghat Section 1:80 gradient 25kV OHE catenary restringing (Severe Corridor Conflict)',
    machinery_type: 'Heavy Wiring Train WT-02',
  },
  // 8. S_AND_T Shadow Block - Track circuit renewal inside BLK-PWAY-104
  {
    block_id: 'BLK-SNT-108',
    demand_code: 'TDMS-2026-055',
    department: 'S_AND_T',
    start_km: 140.0,
    end_km: 144.5,
    start_minutes: 90,  // 01:30
    end_minutes: 210,  // 03:30
    status: 'SHADOW',
    is_shadow: true,
    has_clash: false,
    shadow_parent_id: 'BLK-PWAY-104',
    section_from: 'BPL',
    section_to: 'RKMP',
    activity_description: 'Digital Axle Counter (DAC) reset & bonding joint renewal',
    machinery_type: 'S&T Van SNT-04',
  },
];
