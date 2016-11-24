const uploadLastResult = require('../uploadLastResult');

jest.mock('../getLastResultSummary');
const getLastResultSummary = require('../getLastResultSummary');

jest.mock('../S3Uploader');
const S3Uploader = require('../S3Uploader');

describe('when there are no diffs or new images', () => {
  beforeEach(() => {
    getLastResultSummary.mockImplementation(() => ({
      diffImages: [],
      newImages: [],
    }));
  });

  it('rejects the promise', () =>
    uploadLastResult().catch((message) => {
      expect(message).toEqual('No results to upload');
    }));
});

describe('when there are diffs and new images', () => {
  let uploadMock;

  beforeEach(() => {
    uploadMock = jest.fn();
    uploadMock.mockReturnValue(Promise.resolve());
    S3Uploader.mockImplementation(() => ({
      prepare: () => Promise.resolve(),
      upload: uploadMock,
    }));

    getLastResultSummary.mockImplementation(() => ({
      diffImages: [
        {
          description: 'foo',
          height: 50,
          viewportName: 'small',
        },
        {
          description: 'bar',
          height: 100,
          viewportName: 'medium',
        },
      ],
      newImages: [
        {
          description: 'foo',
          height: 50,
          viewportName: 'small',
        },
      ],
    }));
  });

  it('uploads all images and the index.html file', () =>
    uploadLastResult().then(() => {
      // 2 times each diff, 1 times the new image, 1 times index.html
      expect(uploadMock.mock.calls.length).toEqual(6);
    }));
});
