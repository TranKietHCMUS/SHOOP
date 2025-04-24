# Job Sync Project

1. Create conda environment
```bash
cd /backend
conda env create -f environment.yml
conda activate grab  
```
2. Installing pytorch
```bash
conda install pytorch::pytorch
```
3. Install other packages
```bash
pip install -r requirements.txt --target <your conda environment>
```
