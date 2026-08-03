            switch ((header.flags & TGATools._ORIGIN_MASK) >> TGATools._ORIGIN_SHIFT) {
                default:
                case TGATools._ORIGIN_UL:
                    x_start = 0;
                    x_step = 1;
                    x_end = header.width;
                    y_start = 0;
                    y_step = 1;
                    y_end = header.height;
                    break;

                case TGATools._ORIGIN_BL:
                    x_start = 0;
                    x_step = 1;
                    x_end = header.width;
                    y_start = header.height - 1;
                    y_step = -1;
                    y_end = -1;
                    break;

                case TGATools._ORIGIN_UR:
                    x_start = header.width - 1;
                    x_step = -1;
                    x_end = -1;
                    y_start = 0;
                    y_step = 1;
                    y_end = header.height;
                    break;

                case TGATools._ORIGIN_BR:
                    x_start = header.width - 1;
                    x_step = -1;
                    x_end = -1;
                    y_start = header.height - 1;
                    y_step = -1;
                    y_end = -1;
                    break;
            }
