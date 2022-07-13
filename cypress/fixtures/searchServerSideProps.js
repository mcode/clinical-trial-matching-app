import mockPatient from '../../src/__mocks__/patient';
import mockUser from '../../src/__mocks__/user';

const searchServerSideProps = {
  props: {
    patient: mockPatient,
    user: mockUser,
    primaryCancerCondition: {
      cancerType: { code: '408643008', display: 'Infiltrating duct carcinoma of breast (disorder)' },
      cancerSubtype: null,
      stage: 'IV',
    },
    metastasis: ['Secondary malignant neoplasm of bone (disorder)'],
    ecogScore: '1',
    karnofskyScore: '100',
    biomarkers: [
      'ER Ag Tiss Ql ImStn +',
      'PR Ag Tiss Ql ImStn +',
      'Her2 Ag Tiss Ql ImStn -',
      'MSI Tiss Ql ImStn +',
      'Her2 Tiss-Imp -',
      'Her2 Br ca spec Ql ImStn -',
      'ERBB2 gene Dp Br ca spec Ql FISH -',
      'ER Tiss-Imp +',
      'ER Ag Br ca spec Ql ImStn +',
      'PR Tiss-Imp +',
      'PR Ag Br ca spec Ql ImStn +',
    ],
    radiation: ['Megavoltage radiation therapy using photons (procedure)'],
    surgery: [
      'Partial mastectomy (procedure)',
      'Lumpectomy of breast (procedure)',
      'Excision of axillary lymph node (procedure)',
      'Excision of breast tissue (procedure)',
    ],
    medications: [
      'leuprolide Injetable Product',
      'fulvestrant Injectable Product',
      'abemaciclib Oral Product',
      'ribociclib Oral Product',
    ],
  },
};

export default searchServerSideProps;
