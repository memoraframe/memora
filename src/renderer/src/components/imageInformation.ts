export interface ImageInformation {
    file: string;
    name: string;
}

export default function imageInformation(filePath: string): ImageInformation {
    const pathParts = filePath.split('/');
    const fileName = pathParts.pop() || ''; 
    const folderName = pathParts.pop() || '';

    return {
        file: fileName,
        name: folderName,
    };
}