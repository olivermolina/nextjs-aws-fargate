import type { FC } from 'react';
import PropTypes from 'prop-types';

type Extension = 'jpeg' | 'jpg' | 'mp4' | 'pdf' | 'png' | string;

const icons: Record<Extension, any> = {
  jpeg: '/assets/icons/icon-jpg.svg',
  jpg: '/assets/icons/icon-jpg.svg',
  mp4: '/assets/icons/icon-mp4.svg',
  pdf: '/assets/icons/icon-pdf.svg',
  png: '/assets/icons/icon-png.svg',
  svg: '/assets/icons/icon-svg.svg',
};

interface FileIconProps {
  extension?: Extension | null;
  previewUrl?: string;
  showPreview?: boolean;
}

export const FileIcon: FC<FileIconProps> = (props) => {
  const { extension, previewUrl, showPreview = true } = props;
  let icon: string;

  let style = {};

  if (!extension) {
    icon = '/assets/icons/icon-other.svg';
  } else if (previewUrl && icons[extension] && showPreview) {
    icon = previewUrl;
    style = {
      width: '100%', // or any desired width
      height: '100%', // or any desired height
      objectFit: 'cover', // or 'contain'
      objectPosition: 'center', // adjust as needed
    };
  } else {
    icon = icons[extension] || '/assets/icons/icon-other.svg';
  }

  if (extension === 'pdf' && previewUrl && showPreview) {
    return (
      <iframe
        src={previewUrl}
        width="100%"
        height="600px"
      />
    );
  }

  return (
    <img
      src={icon}
      alt={''}
      style={style}
    />
  );
};

FileIcon.propTypes = {
  extension: PropTypes.string,
};
